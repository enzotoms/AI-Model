import { Link } from 'react-router-dom'
import './homepage.css'
import { TypeAnimation } from 'react-type-animation';
import { useState } from 'react';


const Homepage = () => {

  const [typingStatus, setTypingStatus] = useState("human");

  



  return (
    <div className='homepage'>
      <img src="/orbital.png" alt="" className='orbital' />
      <div className='left'>
        <h1>QuantumMind</h1>
        <h2>Let your creativity be the author of the day!</h2>
        <h3>
          Lorem ipsum dolor sit amet consectetur adipisicing elit.
           Obcaecati facere libero alias.
        </h3>
        <Link to= '/dashboard'>Create!</Link>
      </div>


      <div className='right'>
        <div className="imgContainer">
          <div className="bgContainer">
            <div className="bg"></div>
          </div>

          <img src="/bot.png" alt="" className='model' />

          <div className="chat">
            <img src={typingStatus === "human1"
               ? "/humanone.jpg"
               : typingStatus === "human2"
               ? "/humantwo.jpg"
               : "/human1.png"
                  }
               alt="" className='human'
                />


          <TypeAnimation
      sequence={[
        // Same substring at the start will only be typed out once, initially
        'Human:We produce food for Mice',
        2000, // wait 1s before replacing "Mice" with "Hamsters"
        ()=>{
            setTypingStatus("bot");
        },
        'Bot:We produce food for Hamsters',
        2000,
        ()=>{
          setTypingStatus("human2");
      },
        'Human2:We produce food for Guinea Pigs',
        2000,
        ()=>{
          setTypingStatus("bot");
      },
        'Bot:We produce food for Chinchillas',
        2000,
        ()=>{
          setTypingStatus("human1");
      },
      ]}
      wrapper="span"
      cursor={true}
      repeat={Infinity}
      omitDeletionAnimation={true}
    />
          </div>
        </div>
      </div>

      <div className="terms">
        {/* <img src="/pngwing.com.png" alt="" /><span>Model-QI</span> */}
        <div className="links">
          <Link to="/">Terms and Conditions</Link>
          <span>|</span>
          <Link to="/">Privacy Policy</Link>
        </div>
      </div>


    </div>
  )
}

export default Homepage