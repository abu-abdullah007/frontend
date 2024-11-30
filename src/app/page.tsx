"use client";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useRouter } from "next/navigation";
const socket = io('http://localhost:3001')

export default function Home() {
  const [roomid, setRoomid] = useState('')
  const [username, setUsername] = useState('')
  const [callIo, setCallIO] = useState(false)
  const router = useRouter()

  useEffect(() => {
    socket.on('go-next', ({ roomid, username }) => {
      if (roomid && username) {
        router.push(`/message/${roomid}+${username}`)
      } else {
        console.log(username,roomid)
      }
    })

    return () => {
      socket.off('go-next')
    }
  }, [callIo])

  const handleClick = () => {
    socket.emit('set-room-id', {
      roomid,
      username
    })
    setCallIO(!callIo)
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-r from-[#0c0c1d] via-[#2e2e36] to-[#030314]">
      <div className="container mx-auto h-full flex justify-center items-center">
        <div className="w-[600px] h-[400px] border border-[#ffffff50] bg-gradient-to-r from-[#161212] to-[#1d1b1b] flex justify-center items-center rounded-md">
          <div className="w-4/5 h-2/3 flex justify-evenly flex-col items-center">
            <p className="text-3xl text-[#ffffffa2]">Join Chat</p>
            <input type="text" placeholder="Enter Room ID..." className="p-2 rounded-lg" onChange={(e) => {
              setRoomid(e.target.value)
            }} />
            <input type="text" placeholder="Enter Username..." className="p-2 rounded-lg" onChange={(e) => {
              setUsername(e.target.value)
            }} />
            <button className="bg-[#c9b7b7] px-8 py-2 rounded-lg active:scale-95" onClick={handleClick}>JOIN</button>
          </div>
        </div>
      </div>
    </div>
  );
}
