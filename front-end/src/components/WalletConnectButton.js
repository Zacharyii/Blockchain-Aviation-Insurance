import { useEthers } from "@usedapp/core";

const WalletConnectButton = () => {
    const { activateBrowserWallet, account, deactivate } = useEthers();
    

    return account ? (
        <div className="flex bg-blue-100 p-2 rounded-2xl">
            <h1 className="p-4 bg-gradient-to-r from-pink-700 to-purple-700 text-white text-lg rounded-xl mr-3">欢迎(*^▽^*), {account}</h1>
            <button onClick={deactivate} className="bg-gray-600 bg-gradient-to-r hover:from-gray-400 font-bold hover:to-gray-400 p-4 rounded-xl">断开钱包</button>
        </div>
    ) : (
        <div className="flex bg-gray-200 p-2 rounded-2xl">
        <button className="p-4 bg-gradient-to-r from-pink-700 to-purple-700 text-white text-lg font-bold rounded-xl hover:from-purple-700 hover:to-pink-700" onClick={() => {activateBrowserWallet()}}>连接钱包</button>
        </div>
            )
}

export default WalletConnectButton;