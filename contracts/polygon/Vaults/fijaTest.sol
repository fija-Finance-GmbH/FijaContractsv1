// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20} from "@rari-capital/solmate/src/tokens/ERC20.sol";



/**
 * @dev {ERC20} token, including:
 *
 *  - a minter role that allows for token minting (creation)
 *  - a pauser role that allows to stop all token transfers
 *
 * This contract uses {AccessControl} to lock permissioned functions using the
 * different roles - head to its documentation for details.
 *
 */
//200000000000000000000000000
contract FijaToken is

    ERC20

{


    /**
     * @dev Grants `DEFAULT_ADMIN_ROLE`, `MINTER_ROLE` and `PAUSER_ROLE` to the
     * account that deploys the contract.
     *
     * See {ERC20-constructor}.
     */
    constructor(
        address treasury,
        uint initialSupply,
        uint8 _decimals,
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol, _decimals) {

        _mint(treasury, initialSupply);
    }

    /**
     * @dev Creates `amount` new tokens for `to`.
     *
     * See {ERC20-_mint}.
     *
     * Requirements:
     *
     * - the caller must have the `MINTER_ROLE`.
     */
    function mint(address to, uint amount) public virtual {

        _mint(to, amount);
    }

}
