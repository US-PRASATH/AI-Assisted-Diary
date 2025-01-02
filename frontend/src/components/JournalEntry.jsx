import React, {useState, useRef, useEffect} from "react";
import logo from "../assets/logo.png";
import CustomModal from "./CustomModal";
import api from "../api";

function JournalEntry({journalEntry, onChange}){
    const [showModal, setShowModal] = useState(true);
    const [title, setTitle] = useState(journalEntry.title);
    const [content, setContent] = useState(journalEntry.content);
    const originalTitle = journalEntry.title;
    const originalContent = journalEntry.content;
    const modalRef = useRef(null);

    const formatDate = (timestamp) => {
        const dateObj = new Date(timestamp);
        const options = { day: "2-digit", month: "short", year: "numeric" };
        const formattedDate = dateObj.toLocaleDateString("en-US", options); // Format: 22 Nov 2024
        const dayOfWeek = dateObj.toLocaleDateString("en-US", { weekday: "long" }); // Format: Wednesday
        return { formattedDate, dayOfWeek };
      };
    
      const { formattedDate, dayOfWeek } = formatDate(journalEntry.timestamp);
    
      const handleSubmit = () => {
        console.log("hello");
        if (title !== originalTitle || content !== originalContent) {
          api.put(`/journal/alovelace/journalentry/${journalEntry.id}`, {
              title,
              content,
            }).then((response) => {
              console.log("Updated entry:", response.data);
            }).catch((error) => {
              console.error("Error updating entry:", error);
            });
        }
      };
      
      useEffect(() => {
        const updatedEntry = { ...journalEntry, title, content };
        onChange(updatedEntry);
      }, [title, content]);


    //   useEffect(() => {
    //     console.log("Modal show state changed:", show);
    //     if (!show) {
    //       console.log("helloo"); // Call handleSubmit when modal is closed
    //       handleSubmit();
    //     }
    //   }, [show]);

    //   const handleClickOutside = (event) => {
    //     if (modalRef.current && !modalRef.current.contains(event.target)) {
    //       handleSubmit();
    //       setShowModal(false);
    //     }
    //   };
    
    //   // Add event listener to detect clicks outside the modal
    //   useEffect(() => {
    //     if (showModal) {
    //       document.addEventListener("mousedown", handleClickOutside);
    //     }
    
    //     return () => {
    //       document.removeEventListener("mousedown", handleClickOutside);
    //     };
    //   }, [showModal, title, content]); // Dependencies include title and content to track changes
    
    
    return(
        <div>
            <CustomModal showModal={showModal}>
           {/* <img className='h-12' src={logo}></img>  */}
           <div className="flex gap-5 justify-between mx-10">
           <h3 className="text-2xl">{dayOfWeek}</h3>
           <h3 className="text-2xl">{formattedDate}</h3>  
           </div>
            <input type="text" placeholder="Enter Title"  onChange={(e) => setTitle(e.target.value)} value={title} className="text-2xl w-full outline-none text-center "></input>
           <div className="flex flex-col items-center mt-10 h-80 mx-3">
            {/* <div className="w-9/12 h-full"> */}
            <textarea className="w-full h-screen" onChange={(e)=>setContent(e.target.value)} value={content} />
           {/* </div> */}
           </div>
           </CustomModal>
        </div>
    );
}

export default JournalEntry;