import React from 'react';
import { BigNumber, utils } from 'ethers';
import { Contract } from '@ethersproject/contracts';
import { useRef,useState,useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { Web3Provider } from "@ethersproject/providers";

import FTcontractInterface from '../../artifacts/contracts/Flight.sol/Flight.json'
import IAcontractInterface from '../../artifacts/contracts/Insurance.sol/Insurance.json'
import { useContractFunction } from '@usedapp/core';


const FlightTicketBuy = ({dataarr}) => {
  console.log(dataarr);
  const FTcontractAddress = "0x91d9137F81C1B04e9f5Fc2c77F5eA45E589C31dF";
  const IAcontractAddress = "0x9BeF27A51039DDbc2EBbCB5F6d7FE1078035aE33";
  const FTcontractInterfaceABI = FTcontractInterface.abi;
  const IAcontractInterfaceABI = IAcontractInterface.abi;
  const provider = new Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const FTcontract = new Contract(FTcontractAddress, FTcontractInterfaceABI,signer);
  const IAcontract = new Contract(IAcontractAddress, IAcontractInterfaceABI,signer);
  console.log("IAcontract",IAcontract);
  const [DealyInsurancePrice,setDealyInsurancePrice] = useState(0);
  const [CancelInsurancePrice,setCancelInsurancePrice] = useState(0);
  // const [FTbuystate,FTsend] = useContractFunction(FTcontract,"buyTicket")
  // const [IAbuystate,IAsend] = useContractFunction(IAcontract,"buyInsurance")




  let _DealyInsurancePrice;
  let _CancelInsurancePrice;
  let _insurance = '0';
  let number;
  let _price;
  let i = 0;
const idnumber = useRef();
const seatnumber = useRef();

function getPrice(flightNumber) {
  return IAcontract.getInsurancePrice(flightNumber)
    .then(([delayPrice, cancelPrice]) => {
      setDealyInsurancePrice(delayPrice / Math.pow(10,18));
      setCancelInsurancePrice(cancelPrice /  Math.pow(10,18));
      console.log(DealyInsurancePrice,CancelInsurancePrice);
    }
    ); 
}

const handleBuy = async() => {
  const idNumberInput = prompt('请输入你的身份证号码:');
  const seatNumberInput = prompt('请输入你想要购买的座位号:');


  if (idNumberInput && seatNumberInput) {
    idnumber.current = idNumberInput;
    seatnumber.current = seatNumberInput;
    await TicketBuy();
    InsuranceBuy();
  }
};
  const setPrice = (TP,FN,DP,CP)=>{
    _price = TP;
    number = FN;
    _DealyInsurancePrice = DP;
    _CancelInsurancePrice = CP;
    console.log("price:" + _price , "number:" + number ,"DealyInsurancePrice:" + _DealyInsurancePrice , "CancelInsurancePrice:" + _CancelInsurancePrice);
  }
  const TicketBuy = async()=>{
    if (!FTcontract) {
      console.error("合约对象为空！");
      return;
    }
    else{
      try{
        console.log(
          number,
          idnumber.current,
          seatnumber.current);
        const result =  await FTcontract.buyTicket(
          number,
          idnumber.current,
          seatnumber.current,{
            value: utils.parseEther(_price.toString())
          })
          console.log(result);
          alert('购票成功')
      }catch(error){
        console.log(error);
    toast.error('订票失败：起飞前两个小时不能在网上购买机票或者座位号已被选择');
      }
    }
      
    }
    const InsuranceBuy = async()=>{
      if (!IAcontract) {
        console.error("合约对象为空！");
        return;
      }else if (_insurance === "0"){
        return
      }
      else if (_insurance === "1"){
        try{
          console.log(number,
            _insurance,
            idnumber.current);
          const result =  await IAcontract.buyInsurance(
            number,
            _insurance,
            idnumber.current,{
              value: utils.parseEther(_DealyInsurancePrice.toString())
            })
            console.log(result);
            alert('购买延误险成功')
        }catch(error){
          console.log(error);
      toast.error('延误险购买失败，已购买延误险或机票已失效');
        }
      }else if (_insurance === "2"){
        try{
          console.log(
            number,
            _insurance,
            idnumber.current);
          const result =  await IAcontract.buyInsurance(
            number,
            _insurance,
            idnumber.current,{
              value: utils.parseEther(_CancelInsurancePrice.toString())
            })
            console.log(result);
            alert('购买取消险成功')
        }catch(error){
          console.log(error);
      toast.error('取消险购买失败，已购买取消险或机票已失效');
        }
      }else if (_insurance === "3"){
        try{
          console.log(
            number,
            _insurance,
            idnumber.current);
          const result =  await IAcontract.buyInsurance(
            number,
            _insurance,
            idnumber.current,{
              value: utils.parseEther((_DealyInsurancePrice+_CancelInsurancePrice).toString())
            })
            console.log(result);
            alert('购买延误险和取消险成功')
        }catch(error){
          console.log(error);
      toast.error('延误险或取消险购买失败，已购买延误险或取消险或机票已失效');
        }
      }
        
      }


  let TicketList = [];
  async function handleDataArr(dataarr) {
      dataarr.forEach( (data) => {
        
        const{flight_number ,company_name,departTime,scheduled_arrival_time,price,departPlace,arrivePlace} = data;
        const companyname = company_name.substring(0, 2)
        let logo = '';
      if(companyname){
        logo = "./logos/"+companyname+".png"
      }   
        getPrice(flight_number);
 
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
              <div className="departure-time">{departureTimeDate.getHours().toString().padStart(2, '0')}{':'}{departureTimeDate.getMinutes().toString().padStart(2, '0')}</div>
              <div className="duration">总时长: {duration} 分钟</div>
              <div className="arrival-time">{arrivalTimeDate.getHours().toString().padStart(2, '0')}{':'}{arrivalTimeDate.getMinutes().toString().padStart(2, '0')}</div>
            </div>
            <div className="places">
              <div className="departure-place">{departPlace}</div>
              <div className="arrival-place">{arrivePlace}</div>
            </div>
            <div className="arrival-place">价格：{'    '}{price/ Math.pow(10,18)}{'ETH'}</div>
            <div className="col-12">
            <label htmlFor="insurance-select">请选择保险类型:</label>
            <select  onChange={(e) =>{ _insurance = e.target.value;console.log(_insurance);}} className="form-select border-0" style={{height: "55px"}}>
                                        <option value="0">不购买保险</option>
                                        <option value="1">购买延误险:{'价格为'}{DealyInsurancePrice}{'ETH'}</option>
                                        <option value="2">购买取消险:{'价格为'}{CancelInsurancePrice}{'ETH'}</option>
                                        <option value="3">购买延误险和取消险{'价格为'}{(DealyInsurancePrice+CancelInsurancePrice)}{'ETH'}</option>
            </select>
              <button onClick={()=>{ setPrice(price/ Math.pow(10,18),flight_number,DealyInsurancePrice,CancelInsurancePrice);handleBuy()}} className="btn btn-primary w-100 py-3" type="submit">购买</button>
            </div>
            <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                />
          </div>
        );
        i++
      });}
      handleDataArr(dataarr);

  return TicketList;
 
};

export default FlightTicketBuy;
