import { useEffect, useRef, useState } from 'react';
import './newPrompt.css';
import Upload from '../upload/Upload';
import { IKImage } from 'imagekitio-react';
import model from '../../lib/gemini';
import Markdown from 'react-markdown'
import { useMutation, useQueryClient } from '@tanstack/react-query';


const NewPrompt = ({data}) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');


  const [img, setImg] = useState({
    isLoading: false,
    error:'',
    dbData: {},
    aiData: {},
  });

// this is to start the chat with the model
  const chat = model.startChat({
    history: [
      {
        role: 'user',
        parts: [{ text: 'Hello!, What news is in AI today?' }]
      },
      {
        role: 'model',
        parts: [{ text: "Hello!, i'm quantum mind. what would you like to know?" }]
      },
    ],
    generationConfig: {
      // maxOutputTokens: 100,
    },
  });

//  we use the useRef hook to create a reference to the last message in the chat without
// re-rendering the component. We then use the useEffect hook to scroll to the last message when the component mounts.
    const endRef = useRef(null);
    const formRef = useRef(null);

    // this useEffect makes the page automatically scroll to the bottom of the chat when a new message is sent
  useEffect(() => {
    endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [data,question,answer, img.dbData]);



  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ()=>{
      // this fetches the text from the input field and sends it to the backend to be processed and displayed on the page as a chat
    return fetch(`${import.meta.env.VITE_API_URL}/api/chats/${data._id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: question.length ? question: undefined,
        answer, 
        img: img.dbData?.filePath || undefined,
       }),
    }).then((res) => res.json());
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['chat', data._id] }).then(()=>{
        formRef.current.reset(); // reset the form after the message is sent
        setQuestion('');
        setAnswer('');
        setImg(
          {
            isLoading: false,
            error:'',
            dbData: {},
            aiData: {},
          });
       }) ;
    }, onError: (err) => {
      console.log(err);
    }
  })



// this section is to add a new prompt to the chat
  const add = async (text, isInitial)=>{
    if (!isInitial) setQuestion(text);

// setting up the model to generate the content and display the answer on the page with image, and if no image, just display text
    // setMessageStream for quicker response, then the accumulatedText enables the quicker response
     
    try{
    const result = await chat.sendMessageStream(
      Object.entries(img.aiData).length ? [img.aiData,text] : [text]);

      let accumulatedText = "";
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        console.log(chunkText);
        accumulatedText += chunkText;
        setAnswer(accumulatedText);
      }

      mutation.mutate(); // call the mutation function with the text
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // to get the result from the input field and display on the page
    const text = e.target.text.value;
    if (!text) return;

    add(text, false);
  };

  // IN PRODUCTION IT WILL ONLINE RENDER ONCES
  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasRun.current) {
    if (data?.history?.length === 1) {
      add(data.history[0].parts[0].text, true);
    }
  }
    hasRun.current = true;
  }, []);

  return (
    <>  
    {/* add new chat */}
    {/* this part uses ikimage to display the image on the site */}
    {img.isLoading && <div className=''>Loading...</div>}
    {img.dbData?.filePath && (

      // this fetches the image and loads the image on the site
      <IKImage
        urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
        path={img.dbData?.filePath}
        width='380'
        transformation={[{ width: 380 }]}
        />
    )}

    {question && <div className='message user'>{question}</div>}

    {/* pass the answer inside the "markdown" tag to display the answer in markdown format to be readable by user */}
    {answer && ( <div className='message'>
      <Markdown>{answer}</Markdown>
      </div>
    )}
    
        <div className='endChat' ref={endRef}></div>
        <form className='newForm' onSubmit={handleSubmit} ref={formRef}>
       <Upload setImg={setImg} />
        <input id='file' type='file' multiple={false} hidden />
        <input type="text" name='text' placeholder='Ask anything...' />

        <button>
            <img src="/arrow.png" alt="" />
        </button>
        </form>
    </>
  );
};

export default NewPrompt