import React, {useState, useEffect} from "react"
import {ethers} from "ethers"

const Healthcare = ()=>{
    const [contract, setContract] = useState(null)
    const [account, setAccount] = useState(null)
    const [isOwner, setIsOwner] = useState(null)
    const [provider, setProvider] = useState(null)
    const [signer, setSigner] = useState(null)
    const [providerAddress, setProviderAddress] = useState("")
    const [patientID, setPatientID] = useState("")
    const [diagnosis, setDiagnosis] = useState("")
    const [treatment, setTreatment] = useState("")
    const [patientName, setPatientName] = useState("")
    const [patientRecords, setPatientRecords] = useState([])

    const contractInstance ="0xAD53b8bD8708473C8AddDB91429c7A141504a4C4"

    const contractABI = [
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "patientID",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "patientName",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "diagnosis",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "treatment",
                    "type": "string"
                }
            ],
            "name": "addRecords",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "provider",
                    "type": "address"
                }
            ],
            "name": "authorizedProvider",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [],
            "name": "getOwner",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "patientID",
                    "type": "uint256"
                }
            ],
            "name": "getPatientRecords",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "recordID",
                            "type": "uint256"
                        },
                        {
                            "internalType": "string",
                            "name": "patientName",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "diagnosis",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "treatment",
                            "type": "string"
                        },
                        {
                            "internalType": "uint256",
                            "name": "timestamp",
                            "type": "uint256"
                        }
                    ],
                    "internalType": "struct HealthcareRecords.Record[]",
                    "name": "",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]

    useEffect(()=>{
        const connectWallet = async () => {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                await provider.send("eth_requestAccounts", [])
                const signer = provider.getSigner();
                setProvider(provider);
                setSigner(signer)
                
                const accountAddress = await signer.getAddress();
                setAccount(accountAddress)

                const contract = new ethers.Contract(contractInstance, contractABI, signer)
                setContract(contract)

                const ownerAddress = await contract.getOwner();

                setIsOwner(accountAddress.toLowerCase() === ownerAddress.toLowerCase());

            } catch (error) {
                console.error("Error while connecting wallet", error)
            }
        }
        connectWallet()
    }, [])

    const authorizeProvider =  async () => {
        if(isOwner){
            try {

                const tx = await contract.authorizedProvider(providerAddress)
                await tx.wait();
                alert(`Provider ${providerAddress} authorized successfully`)
            } catch (error) {
                console.error("Only contract owner can authorize diffrent provider", error)
            }
        } else{
            alert("Only contract owner can call this function")
        }
       
    }

    const addRecord = async () => {
        try {
            const tx = await contract.addRecords(patientID,patientName, diagnosis, treatment)
            await tx.wait()
            alert("Record added successfully")
        } catch (error) {
            console.error("Error while adding record", error)
        }
    }

    const fetchPatientRecord = async () => {
        try {
            const records = await contract.getPatientRecords(patientID)
            console.log(records)
            setPatientRecords(records)
        } catch (error) {
            console.error("Error fetching patient records", error)
        }
    }

    return(
        <div className="container">
            <h1 className="title">
                    Healthcare Apllication
            </h1>
            {account && <p className="account-info">Connected Account: {account}</p>}
            {isOwner && <p className="owner-info">You are the contract owner</p>}
        
            <div className="form-section">
                <h2>
                    Fetch Patient Records
                </h2>
                <input className="input-field" type="text" placeholder="Enter Patient ID" value={patientID} onChange={(e)=> setPatientID(e.target.value)}>
                </input>

                <button className="action-button" onClick={fetchPatientRecord}>
                        Fetch Record
                </button>
            </div>

            <div className="form-section">
                <h2>
                    Add Patient Records
                </h2>
                <input className="input-field" type="text" placeholder="Name" value={patientName} onChange={(e)=> setPatientName(e.target.value)}>
                </input>
                <input className="input-field" type="text" placeholder="Diagnosis" value={diagnosis} onChange={(e)=> setDiagnosis(e.target.value)}>
                </input>
                <input className="input-field" type="text" placeholder="Treatment" value={treatment} onChange={(e)=> setTreatment(e.target.value)}>
                </input>
                

                <button className="action-button" onClick={addRecord}>
                       Add Record
                </button>

            </div>

            <div className="form-section">
                <h2>
                Authorize Healthcare Provider
                </h2>

                <input className="input-field" type="text" placeholder="Provider Address" value={providerAddress} onChange={(e)=> setProviderAddress(e.target.value)}>

                </input>

                <button className="action-button" onClick={authorizeProvider}>
                        Authorize Provider
                </button>
             </div>

             <div className="records-section">
                    <h2>
                        Patient Records
                    </h2>

                    {
                        patientRecords.map((record, index)=>(
                            <div key={index}>
                                <p>Record ID: {record.recordID.toNumber()}</p>
                                <p>Name: {record.patientName}</p>
                                <p>Diagnosis ID: {record.diagnosis}</p>
                                <p>Treatment ID: {record.treatment}</p>
                                <p>Timestamp ID: {new Date(record.timestamp.toNumber() * 1000).toLocaleString()}</p>
                            </div>
                        ))
                    }
             </div>
        
        </div>

       
    )
}

export default Healthcare