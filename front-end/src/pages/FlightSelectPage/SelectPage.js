
import { useRef, useState, useEffect } from 'react';
import { useContractFunction } from '@usedapp/core';
import { Contract } from '@ethersproject/contracts';
import { utils } from 'ethers';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Select = ({dataarr})=>{
    // const dataarr = [{flightNumber: 2 ,departuredate: '2023-6-4',scheduledArrivaldate: '2023-6-4',departureTime: '18:00',scheduledArrivalTime:'19:00',departurePoint:'成都',destinationPoint:'北京'}]
    let i = 0;
 
    let TicketList = [];
    if (dataarr) {
      
      // const{flight_number ,company_name,departTime,scheduled_arrival_time,price,departPlace,arrivePlace} = data;

    dataarr.forEach(data => {
      const{flight_number ,company_name,departTime,scheduled_arrival_time,price,departPlace,arrivePlace} = data;
      const companyname = company_name.substring(0, 2)
      let logo = '';
      if(companyname){
        logo = "./logos/"+companyname+".png"
      }    
      const departureTimeDate = new Date(departTime*1000);
        const arrivalTimeDate = new Date(scheduled_arrival_time*1000);
        const duration = Math.floor((  scheduled_arrival_time - departTime)  / 60);
     
      TicketList.push(
        <div className="ticket" key={i}  style={{"marginTop" : "1rem"}}>
          <div className="header">
            <img src={logo} alt="Logo" className="logo" />
            <div className="number">{flight_number}</div>
          </div>
          <div className="times">
            <div className="departure-time">{departureTimeDate.getHours().toString().padStart(2, '0')}{":"}{departureTimeDate.getMinutes().toString().padStart(2, '0')}</div>
            <div className="duration">总时长: {duration} 分钟</div>
            <div className="arrival-time">{arrivalTimeDate.getHours().toString().padStart(2, '0')}{":"}{arrivalTimeDate.getMinutes().toString().padStart(2, '0')}</div>
          </div>
          <div className="arrival-place">价格：{'    '}{price/ Math.pow(10,18)}{'ETH'}</div>
          <div className="places">
            <div className="departure-place">{departPlace}</div>
            <div className="arrival-place">{arrivePlace}</div>
          </div>
          </div>
      );
      i++
    });
  }
  else{
    alert("您还未发布过航班信息！")
    return  <div><h1>您还未发布过航班信息！</h1></div>
  }
return TicketList;

}
export default Select;
