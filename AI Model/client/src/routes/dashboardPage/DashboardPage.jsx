import { useMutation, useQueryClient } from '@tanstack/react-query'
import './dashboardPage.css'
import { useNavigate } from 'react-router-dom'


const DashboardPage = () => {

 const queryClient = useQueryClient()
 const navigate = useNavigate()


  const mutation = useMutation({
    mutationFn: (text)=>{
      // this fetches the text from the input field and sends it to the backend to be processed and displayed on the page as a chat
    return fetch(`${import.meta.env.VITE_API_URL}/api/chats`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    }).then((res) => res.json());
    },
    onSuccess: (id) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['userChats'] });
      navigate(`/dashboard/chats/${id}`);
    }, 
  })



  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = e.target.text.value
    if (!text) return;

    mutation.mutate(text); // call the mutation function with the text
  };



  return (
    <div className="dashboardPage">

      <div className="texts">
        <div className="logo">
          <img src="/pngwing.com.png" alt="" />
          <h1>QuantumMind</h1>
        </div>

        <div className="options">
          <div className="option">
            <img src="/chat.png" alt="" />
            <span>Create New Chat</span>
          </div>
          <div className="option">
            <img src="/images.png" alt="" />
            <span>Generate Images</span>
            </div>
          <div className="option">
            <img src="/codeone.png" alt="" />
            <span>Help With Your Code</span>
            </div>
        </div>
      </div>

      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <input type="text" name='text' placeholder='Ask QuantumMind...' />
          <button>
            <img src="/arrow.png" alt="" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default DashboardPage