import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import axios from "axios";
import * as geocorder from "geocoder"
import { resolve } from "path";


@Injectable()
export class GeoCodingService{
    //https://us1.locationiq.com/v1/search?key=YOUR_API_KEY&q=Statue%20of%20Liberty,%20New%20York&format=json

    public async  getYahooCoordinates(address: string): Promise<{ lat: number; lon: number }> {
        const yourYahooApiKey = "pk.d288b69bd99dc9c9959c29e99048a0a8"
        const response = await axios.get(`https://us1.locationiq.com/v1/search?key=${yourYahooApiKey}&q=${address}&format=json`, {
        
        });
      
        if (response.data.length === 0) {
          throw new NotFoundException('No address found for:', address);
        }
      
        console.log(response.data)
        const { lat, lon } = response.data[0];
        return { lat, lon };
      }

    //extract the long and latitude from a given address/location

   public  async getCordinates(location:string):Promise<{lat:number, lng:number}>{
        return new Promise ((resolve,reject)=>{
            geocorder.geocode(location,(err,data)=>{
                if(err || !data.results || !data.results[0]){
                    reject('Error retrieving cordinates')
                }else {
                    const {lat,lng}=data.results[0].geometry.location;
                    resolve({lat,lng})
                }
            })
        })
    }


    public async GoggleApiCordinates(address:string):Promise<{lat:number, lng:number}>{
        try {
            const response: any = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`,{
                params:{
                    address:address,
                    key:process.env.GOOGLE_MAPS_API
                }

            });

            console.log(response.data)
            const {lat,lng}=response.data.results[0].geometry.location
            return{lat,lng}
        } catch (error) {
            console.log(error)
            throw new HttpException('Failed to retrieve latitude and longitude ',HttpStatus.BAD_GATEWAY)
            
        }
    }




}