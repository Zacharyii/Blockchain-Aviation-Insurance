import "./App.css";
import "./index.css";
import { Web3Provider } from "@ethersproject/providers";
import AdminPage from "./pages/AdminPage";
import { utils } from "ethers";
import ALContractABI from "./artifacts/contracts/Airline.sol/Airline.json";
import { addressEqual, useEthers } from "@usedapp/core";
import UserPage from "./pages/UserPage";
import SelectFlight from "./pages/SelectFlightPage";
import { Contract } from "@ethersproject/contracts";
import { useState,useEffect } from 'react';


const App = () => {
    require('dotenv').config();
    const {  activateBrowserWallet,account, deactivate  } = useEthers();
    // 设置合约拥有者地址
    const ownerAddress = "0xB970deaB39cfE184385c75f4B7a666BB632e8F69";

    // 通过航空公司合约地址、接口创建合约实例对象
    const contractInterface = new utils.Interface(ALContractABI.abi);
    const contractAddress = "0xA54A1E3Ab0E21Dd659537475DcA261ffe3FA0e7e";
    const provider = new Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new Contract(contractAddress, contractInterface, signer);

    const [boolair,setBoolair] = useState(false);
    // 调用航空公司合约内的airlineAuthority方法判断账户是否是航空公司dao成员
     useEffect(() => {
      if (account) {
          contract.functions.getAirlineAuthority(account).then(([bool]) => {
              setBoolair(bool);
          });
      } else {
          setBoolair(false);
      }
   }, [account]);
    return (
     // 获取账户地址
 <div >


               {/* 账户权限获取：
 地址为ownerAddress进入合约管理界面
 地址为garudaIndonesiaAddress进入航班发布界面
 两个都不是进入购票界面 */}
            {account === ownerAddress && <AdminPage contract={contract} />}
            {boolair && <SelectFlight />}
            {account !== ownerAddress && !boolair && account && <UserPage />}
            {!account && !boolair && (
                <div>
          
 <div className="container-xxl py-5">
      <div className="container">
          <div className="row g-4">
              <div className="col-lg-4 col-md-6 service-item-top wow fadeInUp" data-wow-delay="0.1s">
                  <div className="overflow-hidden">
                      <img className="img-fluid w-100 h-100" src="img/service-1.jpg" alt=""/>
                  </div>
                  <div className="d-flex align-items-center justify-content-between bg-light p-4">
                      
                      <h5 className="text-truncate me-3 mb-0">查询航班</h5>
                      <a className="btn btn-square btn-outline-primary border-2 border-white flex-shrink-0" onClick={(e)=>{
                        e.preventDefault();
                        activateBrowserWallet()
                    }
                        }  
                        ><i className="fa fa-arrow-right"></i></a>
                  </div>
              </div>
              <div className="col-lg-4 col-md-6 service-item-top wow fadeInUp" data-wow-delay="0.3s">
                  <div className="overflow-hidden">
                      <img className="img-fluid w-100 h-100" src="img/service-2.jpg" alt=""/>
                  </div>
                  <div className="d-flex align-items-center justify-content-between bg-light p-4">
                      <h5 className="text-truncate me-3 mb-0">购买机票和保险</h5>
                      <a className="btn btn-square btn-outline-primary border-2 border-white flex-shrink-0" href=""><i className="fa fa-arrow-right"></i></a>
                  </div>
              </div>
              <div className="col-lg-4 col-md-6 service-item-top wow fadeInUp" data-wow-delay="0.5s">
                  <div className="overflow-hidden">
                      <img className="img-fluid w-100 h-100" src="img/service-3.jpg" alt=""/>
                  </div>
                  <div className="d-flex align-items-center justify-content-between bg-light p-4">
                      <h5 className="text-truncate me-3 mb-0">查询交易记录</h5>
                      <a className="btn btn-square btn-outline-primary border-2 border-white flex-shrink-0" href=""><i className="fa fa-arrow-right"></i></a>
                  </div>
              </div>
          </div>
      </div>
  </div>
   
  <div>
  <div className="container-fluid fact bg-dark my-5 py-5">
      <div className="container">
          <div className="row g-4">
              <div className="col-md-6 col-lg-3 text-center wow fadeIn" data-wow-delay="0.1s">
                  <i className="fa fa-check fa-2x text-white mb-3"></i>
                  <h2 className="text-white mb-2" data-toggle="counter-up">2023</h2>
                  <p className="text-white mb-0">成立时间</p>
              </div>
              <div className="col-md-6 col-lg-3 text-center wow fadeIn" data-wow-delay="0.3s">
                  <i className="fa fa-users-cog fa-2x text-white mb-3"></i>
                  <h2 className="text-white mb-2" data-toggle="counter-up">190</h2>
                  <p className="text-white mb-0">通航城市</p>
              </div>
              <div className="col-md-6 col-lg-3 text-center wow fadeIn" data-wow-delay="0.5s">
                  <i className="fa fa-users fa-2x text-white mb-3"></i>
                  <h2 className="text-white mb-2" data-toggle="counter-up">3</h2>
                  <p className="text-white mb-0">合作航空公司</p>
              </div>
              <div className="col-md-6 col-lg-3 text-center wow fadeIn" data-wow-delay="0.7s">
                  <i className="fa fa-wrench fa-2x text-white mb-3"></i>
                  <h2 className="text-white mb-2" data-toggle="counter-up">7</h2>
                  <p className="text-white mb-0">员工人数</p>
              </div>
          </div>
      </div>
  </div>            
      <h1 className="text-truncate me-3 mb-0">合作航空公司宣传片</h1>  
      <div className="container-fluid my-5 px-0">
          <div className="video wow fadeInUp" data-wow-delay="0.1s">
              <button type="button" className="btn-play" data-bs-toggle="modal" data-src="https://www.bilibili.com/video/BV1D7411M732?p=2&vd_source=c4ba18bbe97319a66f3f1e278a673e30" data-bs-target="#videoModal">
                  <span></span>
              </button>
  
              <div className="modal fade" id="videoModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                  <div className="modal-dialog">
                      <div className="modal-content rounded-0">
                          <div className="modal-header">
                              <h5 className="modal-title" id="exampleModalLabel">中国国际航空宣传片Land Your Dream（伴梦想着陆）</h5>
                              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                          </div>
                          <div className="modal-body">
                              <div className="ratio ratio-16x9">
                                  <iframe className="embed-responsive-item" src="" id="video" allowFullScreen allowscriptaccess="always"
                                      allow="autoplay"></iframe>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
  
              <h1 className="text-white mb-4">中国国际航空宣传片</h1>
              <h3 className="text-white mb-0">Land Your Dream（伴梦想着陆）</h3>
          </div>
        
      </div> <div className="container-fluid my-5 px-0">
          <div className="video wow fadeInUp" data-wow-delay="0.1s">
              <button type="button" className="btn-play" data-bs-toggle="modal" data-src="https://www.bilibili.com/video/BV1jj411u7dj/?spm_id_from=333.337.search-card.all.click&vd_source=c4ba18bbe97319a66f3f1e278a673e30" data-bs-target="#videoModal">
                  <span></span>
              </button>
  
              <div className="modal fade" id="videoModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                  <div className="modal-dialog">
                      <div className="modal-content rounded-0">
                          <div className="modal-header">
                              <h5 className="modal-title" id="exampleModalLabel">东方航空宣传片</h5>
                              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                          </div>
                          <div className="modal-body">
                              <div className="ratio ratio-16x9">
                                  <iframe className="embed-responsive-item" src="" id="video" allowFullScreen allowscriptaccess="always"
                                      allow="autoplay"></iframe>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
  
              <h1 className="text-white mb-4">东方航空宣传片</h1>
          </div>          
      </div> <div className="container-fluid my-5 px-0">
          <div className="video wow fadeInUp" data-wow-delay="0.1s">
              <button type="button" className="btn-play" data-bs-toggle="modal" data-src="https://www.bilibili.com/video/BV1qb411T7FX/?spm_id_from=333.337.search-card.all.click&vd_source=c4ba18bbe97319a66f3f1e278a673e30" data-bs-target="#videoModal">
                  <span></span>
              </button>
  
              <div className="modal fade" id="videoModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                  <div className="modal-dialog">
                      <div className="modal-content rounded-0">
                          <div className="modal-header">
                              <h5 className="modal-title" id="exampleModalLabel">南方航空宣传片</h5>
                              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                          </div>
                          <div className="modal-body">
                              <div className="ratio ratio-16x9">
                                  <iframe className="embed-responsive-item" src="" id="video" allowFullScreen allowscriptaccess="always"
                                      allow="autoplay"></iframe>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
              <h1 className="text-white mb-4">南方航空宣传片</h1> 
              </div>
        
      </div>
  </div>
                </div>
            )}


        </div>
    )}
export default App;
