import { StatusCodes } from 'http-status-codes';
import UserPrivilege from '../constants/UserPrivilege.js';
import { validate } from '../validator/index.js';
import WOLFResponse from '../entities/WOLFResponse.js';

class UserUtility {
  constructor (client) {
    this.client = client;

    this.privilege = {
      has: async (...args) => this._has(args[0], args[1], args[2])
    };
  }
}

export default UserUtility;
