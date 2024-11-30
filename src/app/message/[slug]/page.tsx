"use client"
import { FaPaperPlane } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import gsap from 'gsap'

export default function Message() {
    const pathname = usePathname();
    const [text, setText] = useState('');
    const [hide, setHide] = useState(true)
    const [joined, setJoined] = useState<{ [key: string]: string }>({})
    const [status, setStatus] = useState<{ [key: string]: string }>({})
    const [messages, setMessages] = useState<Array<{ username: string, message: string }>>([]);
    const [socket, setSocket] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    console.log(joined)

    useEffect(() => {
        const newSocket = io('http://localhost:3001');
        setSocket(newSocket)

        newSocket.emit('join-room', {
            roomid: pathname.split('+')[0].split('/')[2],
            username: pathname.split('+')[1]
        })

        newSocket.on('join-not', data => {
            console.log(`${data.username} Is Joined`)
            setJoined(data)

        })

        newSocket.on('type-event', data => {
            console.log(data)
            setStatus(data)
        })

        newSocket.on('catch-data', (data) => {
            console.log(data)
            setMessages(msg => [...msg, data])
        })

        return () => {
            newSocket.close()
        }

    }, [pathname])

    useEffect(() => {
        if (hide === false) {
            setHide(true)
        }
        setTimeout(() => {
            setHide(false)
        }, 2000)
    }, [joined])

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    const handleClick = () => {
        socket.emit('send-message', {
            username: pathname.split('+')[1],
            message: text
        })
        setText('')
    }

    return (
        <div className="w-screen h-screen relative bg-gradient-to-r from-[black] via-[#05071dee] to-[#000014]">
            <div className="container mx-auto h-full flex justify-center items-center lg:px-40 px-10 py-5">
                <div className="w-full h-full max-h-[1024px] bg-[#1e2127] rounded-lg border border-[white] flex flex-col justify-between">
                    <div className="flex justify-between border-b items-center p-5">
                        <p className="text-[#ffffff94] text-3xl">{pathname.split('+')[1]}</p>
                        <div className="flex justify-between items-center gap-x-1 text-xs">
                            <p className="text-[white]">{(pathname.split('+')[1] !== status.username && status.username !== undefined) ? `${status.username}` : ''}</p>
                            <p className="text-[white]">{pathname.split('+')[1] !== status.username ? status.status : ''}</p>
                        </div>
                    </div>
                    <div className="h-full flex flex-col gap-y-10 overflow-y-scroll p-4">
                        {messages.map((msg, index) => (
                            <div key={index} className="w-full h-auto">
                                <div className={`w-auto max-w-[40%] h-full ${msg.username === pathname.split('+')[1] ? 'float-right bg-[#0f9c4f]' : 'float-left bg-[#2a86db]'} p-4 rounded-lg text-white`}>
                                    {msg.message}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="flex justify-between items-center px-10 border-t">
                        <input
                            type="text"
                            placeholder="Enter Message..."
                            value={text}
                            className="py-4 rounded-b-lg w-4/5 outline-none bg-transparent text-[white]"
                            onChange={(e) => {
                                setText(e.target.value)
                            }}
                            onKeyDown={() => {
                                socket.emit('typing', {
                                    username: pathname.split('+')[1],
                                    status: 'typing...'
                                })
                            }}
                            onKeyUp={() => {
                                setTimeout(() => {
                                    socket.emit('typing', {
                                        username: '',
                                        status: ''
                                    })
                                }, 1000)
                            }}
                            onKeyPress={(e) => {
                                if (text !== '') {
                                    e.key === 'Enter' && handleClick()
                                }
                            }}
                        />
                        <button
                            className="text-2xl active:scale-95 text-[#ffffffc7]"
                            onClick={() => {
                                if (text !== '') {
                                    handleClick()
                                }
                            }}
                        >
                            <FaPaperPlane />
                        </button>
                    </div>
                </div>
            </div>
            {hide &&
                <div id="not" className="absolute top-0 flex flex-col justify-end items-center w-full">
                    <p className="p-2 bg-[#154985b9] text-xl text-[#ffffffc4] rounded-lg">
                        {(joined.username === pathname.split('+')[1] && joined.username !== undefined) ? 'You Joined' : (joined.username !== undefined) ? `${joined.username} Is Joined` : ''}
                    </p>
                </div>}
        </div>
    );
}