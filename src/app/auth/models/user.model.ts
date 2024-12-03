export class AuthModel{
   
    constructor(
        public email:string,
        private _token:string,
       public roles:string[]){}
    get token() {
        return this._token;
    }
}
export interface AuthResponseBackend {
    access_token: string;
    refresh_token: string;
    id_token: string;
    token_type: string;
    expires_in: number;
  }