import React, { useEffect, useRef } from "react";
import logo from "../assets/logo.png";
import { useState } from "react";
import api from "../api";
import JournalEntry from "./JournalEntry";
import GratitudeChart from "./GratitudeChart";

function Dashboard(){
    // const[entries, setEntries] = useState(["Journal Entry 1","Journal Entry 2","Journal Entry 3","Journal Entry 4","Journal Entry 5"]);
    const[entries, setEntries] = useState(null);
    const[showModal, setShowModal] = useState(false);
    const[journalEntry, setJournalEntry] = useState(null);
    const modalRef = useRef(null);
    const compRef = useRef(null);
    const [isNewEntry, setIsNewEntry] = useState(false);
    const[newJournalEntry, setNewJournalEntry] = useState(null);
    const[isUpdated, setIsUpdated] = useState(null);
    const[isDeleted, setIsDeleted] = useState(false);
    const[gratitudeCount, setGratitudeCount] = useState(0);
    const [chartData, setChartData] = useState(null);
    const[gratitudeLine,setGratitudeLine] = useState(null);
    const[token,setToken]=useState(localStorage.getItem("authToken"));
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    useEffect(()=>{
        api.get("/journal/journalentry", {headers}).then((response)=>{
            setEntries(response.data);
            console.log(response);
        });

        api.get("/gratitude_count", {headers}).then((response)=>{
          setGratitudeCount(response.data["count"]);
          console.log(response);

        
      });

      api.get("/random_gratitude_line", {headers}).then((response)=>{
        setGratitudeLine(response.data);
        console.log(response);

      
    });

      

    },[])
    useEffect(() => {
      api.get("/gratitude_growth", {headers}).then((response) => {
        const data = response.data;
  
        const labels = data.map((entry) =>
          new Date(entry.timestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        );
        const counts = data.map((entry) => entry.count);
  
        setChartData({
          labels,
          datasets: [
            {
              label: "Gratitude Growth",
              data: counts,
              borderColor: "rgba(75,192,192,1)",
              backgroundColor: "rgba(75,192,192,0.2)",
              pointBorderColor: "rgba(75,192,192,1)",
              pointBackgroundColor: "rgba(75,192,192,0.2)",
              tension: 0.4,
            },
          ],
        });
        console.log("below is the data");
        console.log(chartData);
      });
    }, []);
  

    useEffect(() => {
        if (!showModal && journalEntry) {
          // Trigger this only when modal is closed and journalEntry has been updated
          api.get("/journal/journalentry", {headers}).then((response) => {
            setEntries(response.data);
            console.log(response);
          });
        }
      }, [showModal]);

      // Refresh entries after a new entry is added
  useEffect(() => {
    if (isNewEntry === false) {
      api.get("/journal/journalentry", {headers}).then((response) => {
        setEntries(response.data);
        console.log("Entries refreshed:", response.data);
      });

      api.get("/gratitude_count", {headers}).then((response)=>{
        setGratitudeCount(response.data["count"]);
        console.log(response);
        api.get("/gratitude_growth", {headers}).then((response) => {
          const data = response.data;
    
          const labels = data.map((entry) =>
            new Date(entry.timestamp).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          );
          const counts = data.map((entry) => entry.count);
    
          setChartData({
            labels,
            datasets: [
              {
                label: "Gratitude Growth",
                data: counts,
                borderColor: "rgba(75,192,192,1)",
                backgroundColor: "rgba(75,192,192,0.2)",
                pointBorderColor: "rgba(75,192,192,1)",
                pointBackgroundColor: "rgba(75,192,192,0.2)",
                tension: 0.4,
              },
            ],
          });
          console.log(chartData);
        });
    });
    }
  }, [isNewEntry, gratitudeCount]);

  useEffect(() => {
    if (isDeleted) {
      api.get("/journal/journalentry", {headers})
        .then((response) => {
          setEntries(response.data);
          console.log("Entries refreshed after deletion:", response.data);
          setIsDeleted(false); // Reset the flag
        })
        .catch((error) => {
          console.error("Error fetching entries after deletion:", error);
        });
    }
  }, [isDeleted]);

    useEffect(() => {
        const handleClickOutside = (event) => {
          if (modalRef.current && !modalRef.current.contains(event.target)) {
            // if(compRef.current){
            // compRef.current.handleSubmit();
            // }
            handleModalClose();
            setShowModal(false);
          }
        };
    
        if (showModal) {
          document.addEventListener("mousedown", handleClickOutside);
        }
    
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }, [showModal,journalEntry,entries]);

      const handleModalClose = () => {
         if (isNewEntry) {
          console.log(headers);
            console.log("Creating new entry...");
            api
              .post("/journal/journalentry", journalEntry, {headers})
              .then((response) => {
                console.log("New entry created:", response.data);
                setEntries((prevEntries) => [response.data, ...prevEntries]);
                setIsNewEntry(false);
              })
              .catch((error) => {
                console.error("Error creating entry:", error);
              });
          }
        else if (journalEntry) {
            const originalEntry = entries.find(entry => entry.journal_id === journalEntry.journal_id);
    
    if (
      originalEntry &&
      (journalEntry.title !== originalEntry.title || journalEntry.content !== originalEntry.content)
    ) {
      // Only send the PUT request if there are changes
      console.log("Changes detected, submitting update...");
      
            console.log("from submit");
            console.log(journalEntry);
          api
            .put(`/journal/journalentry/${journalEntry.journal_id}`, journalEntry, {headers})
            .then((response) => {
              console.log("Entry updated:", response.data);
              const updatedEntries = entries.map((entry) =>
                entry.journal_id === journalEntry.journal_id ? journalEntry : entry
              );
              setEntries(updatedEntries);
              setJournalEntry(
                {content:'', journal_id:'', timestamp: '', title: ''}
              )
            })
            .catch((error) => {
              console.error("Error updating entry:", error);
            });
        } else {
            console.log("No changes detected, skipping update.");
          }
    }
        setShowModal(false);
      };

      const handleDelete = (journal_id) => {
        api.delete(`/journal/journalentry/${journal_id}`, {headers}).then((response)=>{
            console.log(response.data);
            setIsDeleted(true);
        })
            
      }

      const handleNewEntryClick = () => {
        setIsNewEntry(true); // Mark as new entry
        setJournalEntry({ title: "", content: "", timestamp: new Date().toISOString() });
        setShowModal(true);
      };

      const handleEntryClick = (entry) => {
        setIsNewEntry(false); // Mark as existing entry (not new)
        setJournalEntry(entry); // Set the existing entry to edit
        setShowModal(true); // Show the modal
    };

    const formatDate = (timestamp) => {
        const dateObj = new Date(timestamp);
        const options = { day: "2-digit", month: "short", year: "numeric" };
        const formattedDate = dateObj.toLocaleDateString("en-US", options); // Format: 22 Nov 2024
        // const dayOfWeek = dateObj.toLocaleDateString("en-US", { weekday: "long" }); // Format: Wednesday
        return { formattedDate};
      };
    

//        // UseEffect to track journalEntry changes and log
//   useEffect(() => {
//     if (journalEntry) {
//       console.log("Updated journal entry:", journalEntry); // Logs updated entry
//     }
//   }, [journalEntry]); // Watch for changes to journalEntry state

    return(
        <div>
            {/* <img className='h-12' src={logo}></img> */}
            {/* <h3 className="text-2xl">"You found peace and joy in the simple beauty of the ocean today—let it remind you that tranquility is always within reach."</h3> */}
            {gratitudeLine ? (<h3 className="text-2xl">{gratitudeLine}</h3>)
            :
            (<p>Loading...</p>)
            }
            <div className="flex justify-center items-center mt-10 gap-10">
            {/* <div className="py-36 px-56  bg-gray-700"></div> */}
            <GratitudeChart chartData={chartData}/>
            {/* <div className="p-10 break-words text-xl w-1/2">"You've discovered more than [{gratitudeCount}] moments to be grateful for this month—each one a reminder of the abundance of joy in your life."</div> */}
            <div className="p-10 break-words text-xl w-1/2">
  "You've uncovered over [{gratitudeCount}] moments brimming with positivity and inspiration!"
</div>

            </div>
            <button
        onClick={handleNewEntryClick}
        className="fixed bottom-10 right-10 bg-blue-500 text-white rounded-full p-4"
      >
        +
      </button>
            <div className="mt-10 overflow-auto h-64">
            {entries && entries.map((e)=><div className="flex flex-col items-center m-5 relative">
                <div key={e.journal_id} className="flex items-center justify-between w-3/5"><p onClick={()=>{
                    // console.log(e);
                    // setShowModal(true);
                    // setJournalEntry(e);
                    handleEntryClick(e);
                }}className="cursor-pointer text-xl text-left truncate">{`${formatDate(e.timestamp).formattedDate} - ${e.title}`}</p><button onClick={() => handleDelete(e.journal_id)} className="text-red-500">x</button>
</div>
                
                <hr className="text-black bg-black h-0.5 w-2/3 "/>
                </div>
                
        )}
        </div>
        {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div
              ref={modalRef}
              className="bg-white p-6 rounded-lg shadow-lg w-2/3"
            >
                <JournalEntry ref={compRef} show={showModal} journalEntry={journalEntry} onChange={(updatedEntry) => {
                    // console.log(updatedEntry);
                    // if(!isNewEntry){
                    setJournalEntry(updatedEntry);
                // }
                // else{
                //     setNewJournalEntry(updatedEntry);
                // }
                    // console.log("from journal entry");
                    // console.log(journalEntry);
                    }}/>
                </div>
            </div>
        )}
            
        </div>
    );
}

export default Dashboard;
