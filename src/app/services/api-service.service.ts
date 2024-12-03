import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiServiceService {

   baseUrl=environment.apiUrl
   userToken=localStorage.getItem("token")
    headers= new HttpHeaders({
      Authorization:`Bearer ${this.userToken}`,
      'Content-Type': 'application/json'

    })

   constructor(private http:HttpClient,private auth:AuthService) {
  }

  //Main-Items
  getMainItems<T>( ):Observable<T>{
    return this.http.get<T>(`${this.baseUrl}/mainitems`,{headers:this.headers})
  }
  getMainItemByID<T>(id:number):Observable<T>{
 
    return this.http.get<T>(`${this.baseUrl}/mainitems/${id}`,{headers:this.headers})
  }
  postMaintItem<T>(item:any):Observable<T>{
   
     return this.http.post<T>(`${this.baseUrl}/mainitems`,item,{headers:this.headers})
  }
  patchMainItem<T>(id:number,body: any):Observable<T>{
  
   return this.http.put<T>(`${this.baseUrl}/mainitems/${id}`,body,{headers:this.headers})
  }
  deleteMainItem<T>(id: number):Observable<T>{

    return this.http.delete<T>(`${this.baseUrl}/mainitems/${id}`,{headers:this.headers});
  }
  //Sub-Items
  getSubItems<T>():Observable<T>{
    
    return this.http.get<T>(`${this.baseUrl}/subitems`,{headers:this.headers})
  }

  getSubItemByID<T>(id:number):Observable<T>{
  
    return this.http.get<T>(`${this.baseUrl}/subitems/${id}`,{headers:this.headers})
  }
  postSubItems<T>(item:any,id:number ):Observable<T>{
  
    return this.http.post<T>(`${this.baseUrl}/subitems`,item,{headers:this.headers})
  }
  updateSubItems<T>(item:any,id:number):Observable<T>{

    return this.http.put<T>(`${this.baseUrl}/subitems`,item,{headers:this.headers})
  }
  deleteSubItems<T>(id: number):Observable<T>{
   
    return this.http.delete<T>(`${this.baseUrl}/subitems/${id}`,{headers:this.headers});
  }
  getServices<T>():Observable<T>
  {
  
    return this.http.get<T>(`${this.baseUrl}/servicenumbers`,{headers:this.headers})
  }
  getFormula<T>():Observable<T>
  {

  return this.http.get<T>(`${this.baseUrl}/formulas`,{headers:this.headers})
  }
  getCurrency<T>() :Observable<T>
  {
   
    return this.http.get<T>(`${this.baseUrl}/currencies`,{headers:this.headers})
  }
  putFormula<T>( id: number, body: any):Observable<T>{

    return  this.http.put<T>(`${this.baseUrl}/${id}`, body,{headers:this.headers});

  }
  patchFormula<T>( id: number,body: any): Observable<T> {
   
    return this.http.patch<T>(`${this.baseUrl}/${id}`, body,{headers:this.headers});
  }
}

