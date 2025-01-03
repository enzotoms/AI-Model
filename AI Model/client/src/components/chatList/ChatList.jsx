import { Link } from 'react-router-dom'
import './chatList.css'
import { useQuery } from '@tanstack/react-query'

const ChatList = () => {

  const { isPending, error, data } = useQuery({
    queryKey: ['userChats'],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}/api/userchats`, {
        credentials: 'include',
      }).then((res) =>
        res.json(),
      ),
  })


  return (
    <div className='chatList'>
        <span className='title'>DASHBOARD</span>
        <Link to= "/dashboard">Create a new Chat</Link>
        <Link to= "/">Explore QuantumMind AI</Link>
        <Link to= "/">Help & Support</Link>

        <hr />

    {/* TO DISPLAY ALL CHAT HISTORIES */}
        <span className='title'>CHAT HISTORY</span>
        <div className="list">
        { isPending ? "Loading..." : error ? "Something Went Wrong!" : data?.map((chat)=>(
          <Link to={`/dashboard/chats/${chat._id}`} key={chat._id}>{chat.title}</Link>
        ))}
        </div>

        <hr /> 

        <div className="upgrade">
            <img src="/pngwing.com.png" alt="" />
            <div className="texts">
                <span>Upgrade to Pro</span>
                <span>Unlock all features</span>
            </div>
        </div>
    </div>
  )
}

export default ChatList;