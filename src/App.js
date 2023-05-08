import React, { useState, useEffect, useCallback } from 'react';
// import { ethers } from "ethers";
import { shortenAddress} from "./utils/helpers.js"
import nft from './nft.jpeg';
import logo_2200 from './logo.webp';
import logo_1024 from './logo_1024.webp';
import logo_700 from './logo_700.webp';

import './App.css';
import Tilt from 'react-parallax-tilt';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

// import useMediaQuery from '@mui/material/useMediaQuery';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TwitterIcon from '@mui/icons-material/Twitter';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import axios from 'axios';

import {Helmet} from 'react-helmet';



const ColorButton = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText(grey[500]),
  backgroundColor: grey[300],
  borderRadius: 100,
  fontWeight: 700,
  '&:hover': {
    backgroundColor: grey[700],
  },
  '&:disabled': {
    backgroundColor: grey[800],
    color: grey[100],
  },
}));

const AlertDialogButton = styled(Button)(({ theme }) => ({
  color: grey[100],
  backgroundColor: grey[900],
  borderRadius: 100,
  minWidth: 200,
  fontWeight: 600,
  '&:hover': {
    backgroundColor: grey[700],
  },
  '&:disabled': {
    backgroundColor: grey[800],
    color: grey[100],
  },
}));

const ConnectButton = styled(Button)(({ theme }) => ({
  // color: theme.palette.getContrastText(grey[500]),
  backgroundColor: grey[50],
  color: grey[900],
  borderRadius: 100,
  '&:hover': {
    backgroundColor: grey[500],
  },
}));


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const App = () => {
  // const server = "https://muzebackend.eventdao.io";
  const server = "http://localhost:3300";

  const distance_limit = 100000; // meters

  
 

  const urlParams = new URLSearchParams(window.location.search);
  const muzeID = urlParams.get('event');

  
  const [currentAccount, setCurrentAccount] = useState("connect wallet");
  const [distance, setDistance] = useState(9999999999);
  // const [walletButtonColor, setwalletButtonColor] = useState(red[500]); // programmatic color change

  // get params from url
  
  // muze bilgileri
  const [muzeLink, setmuzeLink] = useState("");
  const [muzeIntroShort, setmuzeIntroShort] = useState("");
  const [muzeName, setmuzeName] = useState("");
  // const [muzeID, setmuzeID] = useState("");
  

  // responsive dialog box
  const [open, setOpen] = React.useState(true);
  // alert dialog box
  const [status_alertDialogBox, setstatus_alertDialogBox] = useState(false);
  const [text_alertDialogBox, settext_alertDialogBox] = useState("");
  // const theme = useTheme();

  // mint button
  const [mintButtonText, setmintButtontext] = useState("Mint NFT");
  const [mintButtonState, setmintButtonState] = useState(false);

  // alert box icon
  const [alertBoxIcon, setalertBoxIcon] = useState("info");


  const handleClose = (event, reason) => {
    if (reason && reason === "backdropClick") 
        return;
    else
        setOpen(false);
        checkIfWalletIsConnected();
  }

  const handleClose_alertDialog = (event, reason) => {
        setstatus_alertDialogBox(false);

        // check mint status
        const fetcMintStatus = async () => {
          try {
            await checkMintStatus(currentAccount);
          } catch (error) {
            console.log("fetchMintstatus: ", error);
          }
        };
        fetcMintStatus();
  }

  const handlegoOpendea_alertDialog = (event, reason) => {
        setstatus_alertDialogBox(false);

        window.open("https://opensea.io/", "_blank");
  }

  const handleGoToMap_alertDialog = (event, reason) => {
        
        window.open(muzeLink, "_blank");
  }

  
  // responsive dialog box ends here
  useEffect(() => {
    // console.log("useEffect");
    if (navigator.geolocation) {
      
      // setmuzeID(urlParams.get('museum'));
  
    
      navigator.geolocation.getCurrentPosition(function(position) {
        console.log("Latitude is :");
        console.log("", position.coords.latitude,",", position.coords.longitude);
  
        // get muze locations
        var lt1 = 0;
        var ln1 = 0;
        var adres = "";
        var data = "";
        const fetchCoord = async () => {
          try {
            const response = await axios.get(server+"/locations/" + muzeID);
  
            // console.log("fetchCoord response: ", response);
            
            lt1 = response.data[0].Lat;
            ln1 = response.data[0].Long;
            adres = response.data[0].Adres;
            data = response.data[0].Data;
  
            setmuzeLink("http://www.google.com/maps/place/"+adres+"/@"+lt1+","+ln1+",15z/data="+data);
            setmuzeIntroShort(response.data[0].Intro_short);
            setmuzeName(response.data[0].Name);
  
            // console.log("mysql return Muze (id: "+muzeID+") location is :", lt1, ln1);
  
            // calculate distance
            var lt = position.coords.latitude;
            // var lt1 = muze_coors[0];
            var ln = position.coords.longitude;
            // var ln1 = muze_coors[1];
            var dLat = (lt - lt1) * Math.PI / 180;
            var dLon = (ln - ln1) * Math.PI / 180;
            var a = 0.5 - Math.cos(dLat) / 2 + Math.cos(lt1 * Math.PI / 180) * Math.cos(lt * Math.PI / 180) * (1 - Math.cos(dLon)) / 2;
            var d = Math.round(6371000 * 2 * Math.asin(Math.sqrt(a)));
  
            setDistance(d);
  
            console.log("Distance is :", d, " meters");
            
          }catch (error) {
            console.log("distance calculation error: "+error);
          }
        };
        fetchCoord();
  
        
      });
    } else {
      console.log("Geolocation is not supported by this browser.");
      
    }
  }, []); // bundan emin değilim, react hook warning veriyordu

  // Ether helper functions
// ether constants
const NETWORK_PARAMS = {
  chainId: "0x1", // A 0x-prefixed hexadecimal chainId
  chainName: "Ethereum Mainnet",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: ["https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],
  blockExplorerUrls: ["https://rinkeby.etherscan.io/"],
};

const checkMintStatus = async (account) => {
  // console.log("checking mint status. current account: #", account,"$");

  // const data = {
  //   "museum_id":muzeID,
  //   "address":currentAccount,
  // }

  try {
    const response = await axios.get(server+"/checkAccount/" + account + "/" + muzeID);

    // console.log("response: #", response.data,"$");

    if (response.data === true) {
      setmintButtontext("Already Minted");
      setmintButtonState(true);
      
    } else if (response.data === false) {
      setmintButtontext("Mint NFT");
      setmintButtonState(false);
    }
    
  } catch (error) {
    console.log(error);
  }
};

const connectWallet = useCallback(async () => {
  try {
    const { ethereum } = window;
    
    if (!ethereum) {
      window.open("https://metamask.io/", "_blank");
      return;
    }

    /*
     * Fancy method to request access to account.
     */
    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    });

    /*
     * Boom! This should print out public address once we authorize Metamask.
     */
    console.log("Connected", accounts[0]);
    setCurrentAccount(accounts[0]);
    
    // check mint status
    const fetcMintStatus = async () => {
      try {
        await checkMintStatus(accounts[0]);
      } catch (error) {
        console.log("fetchMintstatus: ", error);
      }
    };
    fetcMintStatus();

  } catch (error) {
    console.log(error);
  }
}, []); // hook warning vermişti orjinal: }, []);

const setupEventListener = async () => {
  try {
    const { ethereum } = window;

    if (ethereum) {
      // const provider = new ethers.providers.Web3Provider(ethereum);
      // const signer = provider.getSigner();
      // const connectedContract = new ethers.Contract(
      //   CONTRACT_ADDRESS,
      //   myEpicNft.abi,
      //   signer
      // );

      // connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
      //   console.log(from, tokenId.toNumber());
      //   alert(
      //     `Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: ${OPENSEA_LINK}/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
      //   );
      // });

      console.log("Setup event listener!");
    } else {
      console.log("Ethereum object doesn't exist!");
    }
  } catch (error) {
    console.log(error);
  }
};

const checkIfWalletIsConnected = async () => {
  /*
   * First make sure we have access to window.ethereum
   */
  const { ethereum } = window;

  if (!ethereum) {
    console.log("Make sure you have metamask!");
    connectWallet();
    return;
  } else {
    console.log("We have the ethereum object", ethereum);
  }

  // Ensure network is correct
  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: NETWORK_PARAMS.chainId }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [NETWORK_PARAMS],
        });
      } catch (addError) {}
    }
  }

  /*
   * Check if we're authorized to access the user's wallet
   */
  const accounts = await ethereum.request({ method: "eth_accounts" });

  /*
   * User can have multiple authorized accounts, we grab the first one if its there!
   */
  if (accounts.length !== 0) {
    const account = accounts[0];
    console.log("Found an authorized account:", account);
    setCurrentAccount(account);
    // setwalletButtonColor(grey[500]); // change wallet button color programatically
    // Setup Event listener if user is already connected
    setupEventListener();

    // check mint status
    const fetcMintStatus = async () => {
      try {
        await checkMintStatus(account);
      } catch (error) {
        console.log("fetchMintstatus: ", error);
      }
    };
    fetcMintStatus();

  } else {
    console.log("No authorized account found");
    connectWallet();
  }
};

const mint = async () => {
  console.log("Minting NFT...");

  checkIfWalletIsConnected();
  
  const data = {
    "museum_id":muzeID,
    "address":currentAccount,
  }

  

  if (distance > distance_limit) {
    settext_alertDialogBox("Location Error! You are not in the museum or your location service is not available.");
    setalertBoxIcon("ErrorIcon")
    setstatus_alertDialogBox(true);
  } else if (currentAccount === "connect wallet") {
    settext_alertDialogBox("Wallet Error! Please connect your wallet to mint NFT.");
    setstatus_alertDialogBox(true);  
  } else {
    try {
      const res = await axios.post(server+"/mintList", data) 
      console.log("Minting res: ", res);
      if (res.data === "success") {
        checkMintStatus(currentAccount);
        settext_alertDialogBox("Congratulations! You have successfully minted your NFT! It will be available in your wallet within 24 hours.");
        setalertBoxIcon("CelebrationIcon")
        setstatus_alertDialogBox(true);
      }else if (res.data === "According to data records, this address has already been minted.") {
        settext_alertDialogBox("According to data records, this address has already been minted.");
        setalertBoxIcon("ErrorIcon")
        setstatus_alertDialogBox(true);
      }else if (res.data === "error") {
        settext_alertDialogBox("Minting Error!");
        setalertBoxIcon("ErrorIcon")
        setstatus_alertDialogBox(true);
      } else {
        settext_alertDialogBox(res.data);
        setalertBoxIcon("ErrorIcon")
        setstatus_alertDialogBox(true);
      }
        
    } catch (error) {
      setalertBoxIcon("ErrorIcon")
      settext_alertDialogBox("Unable to mint NFT! Please try again later.");
      setstatus_alertDialogBox(true);
    }
  }
}

// ether functions ends here //////////////////////////////////////////


// render starts here //////////////////////////////////////////
  return (
    <div className="App">
      <Helmet>
                {/* <style>{'body { background-color: #191919; }'}</style> */}
                <style>{'body { background-color: #191919; }'}</style>
            </Helmet>
      <header className="App-header">

      <div>

      {/* Alert dialog box */}
      <Dialog
        PaperProps={{
          style: { borderRadius: 20, maxWidth: '40%' }
        }}
        open={status_alertDialogBox}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose_alertDialog}
        aria-describedby="alert-dialog-slide-description"
      >
                <DialogTitle style={{textAlign: "center", fontWeight: 'bold', color: "#000000", fontSize:"3em"}}>
                  
                      {(function() {
                        if (alertBoxIcon === "info") {
                          return "ℹ️";
                        } else if (alertBoxIcon === "CelebrationIcon") {
                          return "🎉";
                        } else if (alertBoxIcon === "ErrorIcon") {
                          return "⚠️";
                        }
                      })()}
                </DialogTitle>
        
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description" style={{textAlign: "center", fontWeight: "bold"}}>
            {text_alertDialogBox}
          </DialogContentText>
        </DialogContent>
        <DialogActions style={{ justifyContent: "center", marginBottom:"5%" }}>
                      
                      {(function() {
                        if (alertBoxIcon === "CelebrationIcon") {
                          return <AlertDialogButton 
                                  sx={{borderRadius: 100}}
                                  variant="outlined" 
                                  onClick={handlegoOpendea_alertDialog}>
                                      Go to OpenSea
                                  </AlertDialogButton>;
                        } else {
                          return <AlertDialogButton 
                                  sx={{borderRadius: 100}}
                                  variant="outlined" 
                                    onClick={handleClose_alertDialog}>
                                      Close
                                  </AlertDialogButton>;
                        }
                      })()}
            
        </DialogActions>
      </Dialog>

      {/* Alert dialog box ends here */}
        
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="responsive-dialog-title"
          disableEscapeKeyDown={true}
          
          sx={{
            backdropFilter: "blur(5px)",
            //other styles here
          }}
          
          PaperProps={{
            style: { borderRadius: 20,  minWidth: '40%'}
          }}
          // PaperProps={{ sx: { width: "50%", height: "40%" } }}
          // sx={{ minHeight: '500px'}}
        >
          {/* <DialogTitle id="responsive-dialog-title" style={{textAlign: "center"}}>
            
          </DialogTitle> */}
          <DialogContent style={{textAlign: "center", marginBottom: "0px"}}>
            
            <DialogContentText style={{textAlign: "center"}}>
              <Typography sx={{fontWeight: 'bold', color: "#000000", fontSize:"3em"}} paragraph>
                            {(function() {
                              if (distance >= 9999999999) {
                                return "🔍";
                              } else if (distance > distance_limit && distance < 9999999999) {
                                return "🗺️";
                              } else {
                                return "🎫";
                              }
                            })()}
                
              </Typography>

              <Typography sx={{fontWeight: 'bold', color: "#000000"}} paragraph>
                              {(function() {
                              if (distance >= 9999999999) {
                                return "Please wait a few moment.";
                              } else if (distance > distance_limit && distance < 9999999999) {
                                return " You are too far away from the event.";
                              }
                               else {
                                return "Lets connect your wallet to mint NFT.";
                              }
                            })()}
              </Typography>

              <Typography sx={{color: "#000000"}} paragraph>
                              {(function() {
                              if (distance >= 9999999999) {
                                return "If checking fails please check your location settings. If location services are turned off, please turn them on. And refresh the page.";
                              } else if (distance > distance_limit && distance < 9999999999) {
                                return "Try again after reaching the event area";
                              }
                              
                            })()}
              </Typography>

              
            </DialogContentText>
          </DialogContent>
          <DialogActions style={{ justifyContent: "center", marginBottom:"5%" }}>
                              {(function() {
                              if (distance <= distance_limit) {
                                return <AlertDialogButton
                                          variant="contained" 
                                          onClick={handleClose} autoFocus>
                                          Connect Wallet
                                        </AlertDialogButton>;
                              } else if (distance > distance_limit && distance < 9999999999){
                                return <AlertDialogButton variant="contained"
                                          onClick={handleGoToMap_alertDialog} autoFocus>
                                          go to event
                                        </AlertDialogButton>;
                              }
                            })()}
            
          </DialogActions>
        </Dialog>
      </div>
        
        <div className="wrap-header-content">
          
          <div className="walletButtonContainer">
            <div className="left">
            {/* <img className='logo' alt='eventdao logo' src={logo} /> */}
            <img className='logo' src={logo_2200} srcSet={`${logo_700} 767w, ${logo_1024} 991w, ${logo_2200} 1500w`}  alt="eventdao logo" />

            </div>
            <div className="right">
                    <IconButton aria-label="twitter" 
                      sx={{ color: grey[50] }}
                      onClick={() => {
                        window.open("https://twitter.com/Event_DAO", "_blank");
                      }}>
                      <TwitterIcon />
                    </IconButton>

                    
                    <div>
                      <ConnectButton variant="contained"
                          // sx={{ background: walletButtonColor }} // programatically change button color
                          // sx={{ width: 200, padding: 1, margin: 2 }}
                          onClick={() => {
                            connectWallet();
                          }}>
                              {(function() {
                                
                                if (currentAccount === "connect wallet") {
                                  return currentAccount
                                } else {
                                  return shortenAddress(currentAccount, 4)
                                }
                              })()}

                      </ConnectButton>
                    </div>
            </div>
                    
          </div>
          <div className="header-columns-wrap w-row">
            
            <div className="left-column-header w-col w-col-6 w-col-stack w-col-small-small-stack w-col-tiny-tiny-stack">
              <h1>Museums of <span className="text-span-2">{muzeName}</span></h1>
              <div className="title-line"></div>
              <div className="wrap-countdown">
                <p>{muzeIntroShort}</p>
              </div>
              {/* <div className="wrap-countdown">Minted Amount: 943</div> */}
              <div className="header-cta">
                  <ColorButton variant="contained"
                    disabled = {mintButtonState}
                    onClick={() => {
                      mint();
                    }}>
                    {mintButtonText}
                  </ColorButton>
              </div>
            </div>
            <div className="right-column-header w-col w-col-6 w-col-stack w-col-small-small-stack w-col-tiny-tiny-stack">
              <div  className="header-image-wrap">
                        
                <div  className="header-image-container">
                  {/* <div className="stars1"></div> */}
                  <Tilt>
                    {/* <div style={{ height: '300px', backgroundColor: 'darkgreen' }}> */}
                    <div>
                      <div className="highlight-hero-image"></div>
                      <img src={nft} className="header-image" alt="logo" sizes="(max-width: 479px) 194.296875px, (max-width: 767px) 60vw, (max-width: 991px) 67vw, 40vw" /> 
                    </div>
                  </Tilt>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;