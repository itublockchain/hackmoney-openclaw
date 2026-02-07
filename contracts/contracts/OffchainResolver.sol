// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IExtendedResolver {
    function resolve(bytes memory name, bytes memory data) external view returns (bytes memory);
}

/**
 * @title OffchainResolver
 * @dev Implements ENSIP-10 (Wildcard resolution) and CCIP-Read (Offchain lookup).
 * Redirects resolution to a gateway URL and verifies the response.
 */
contract OffchainResolver is IExtendedResolver, Ownable, IERC165 {
    using ECDSA for bytes32;

    string public url;
    mapping(address => bool) public signers;

    error OffchainLookup(address sender, string[] urls, bytes callData, bytes4 callbackFunction, bytes extraData);

    constructor(string memory _url, address[] memory _signers) Ownable(msg.sender) {
        url = _url;
        for (uint i = 0; i < _signers.length; i++) {
            signers[_signers[i]] = true;
        }
    }

    function setSigner(address _signer, bool _isValid) external onlyOwner {
        signers[_signer] = _isValid;
    }

    function setUrl(string memory _url) external onlyOwner {
        url = _url;
    }

    function makeSignatureHash(address target, uint64 expires, bytes memory request, bytes memory result) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(
            hex"1900",
            target,
            expires,
            keccak256(request),
            keccak256(result)
        ));
    }

    /**
     * @dev Resolves a name by reverting with an OffchainLookup error.
     * @param name The DNS-encoded name to resolve.
     * @param data The ABI encoded data for the underlying resolution function (e.g. addr(bytes32)).
     */
    function resolve(bytes calldata name, bytes calldata data) external override view returns (bytes memory) {
        string[] memory urls = new string[](1);
        urls[0] = url;
        
        // We revert with OffchainLookup to tell the client to query the gateway.
        revert OffchainLookup(
            address(this),
            urls,
            abi.encodeCall(IExtendedResolver.resolve, (name, data)),
            this.resolveWithProof.selector,
            abi.encode(data, msg.sender) // Pass original data as extraData
        );
    }

    /**
     * @dev Callback used by CCIP-Read compatible clients to verify the gateway response.
     * @param response The response from the gateway, ABI encoded. 
     *      Expected format: (bytes result, uint64 expires, bytes signature)
     * @param extraData The extra data passed in OffchainLookup.
     */
    function resolveWithProof(bytes calldata response, bytes calldata extraData) external view returns (bytes memory) {
        (bytes memory innerData, address sender) = abi.decode(extraData, (bytes, address));
        (bytes memory result, uint64 expires, bytes memory sig) = abi.decode(response, (bytes, uint64, bytes));

        address signer = ECDSA.recover(
            keccak256(abi.encodePacked(
                hex"1900",
                address(this),
                expires,
                keccak256(innerData), // The original request data
                keccak256(result)
            )),
            sig
        );

        require(signers[signer], "SignatureVerifier: Invalid sig");
        require(block.timestamp <= expires, "SignatureVerifier: Expired");

        return result;
    }

    function supportsInterface(bytes4 interfaceID) public pure override returns (bool) {
        return interfaceID == type(IExtendedResolver).interfaceId 
            || interfaceID == type(IERC165).interfaceId
            || interfaceID == 0x3b3b57de // addr(bytes32)
            || interfaceID == 0x59d1d43c // text(bytes32,string)
            || interfaceID == 0xbc1c58d1; // contenthash(bytes32)
    }
}
