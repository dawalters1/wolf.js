import axios from 'axios';

class Client {
  constructor (client) {
    this.client = client;
    this.axiosClient = axios.createClient();
  }
}

export default Client;
