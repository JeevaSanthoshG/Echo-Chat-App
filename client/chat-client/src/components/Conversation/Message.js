import { Box, Stack } from '@mui/material'
import React from 'react'
import { MediaMsg, ReplyMsg, Timeline, TxtMsg, LinkMsg, DocMsg } from './MsgTypes'
import {Chat_History} from '../../data'

const Message = ({menu}) => {
  return (
    <Box p={3}>
        <Stack spacing={3}>
            {Chat_History.map((el) => {
                switch (el.type) {
                    case "divider":
                        return <Timeline el={el} />
                    case "msg":
                        switch (el.subtype) {
                            case "img":
                                return <MediaMsg el={el} menu={menu}/>
                            case "doc":
                                return <DocMsg el={el} menu={menu}/>
                               
                            case "link":
                                return <LinkMsg el={el} menu={menu}/>
                                
                            case "reply":
                                return <ReplyMsg el={el} menu={menu}/>
                                
                            default:
                                return <TxtMsg el={el} menu={menu}/>
                        }
                    default:
                        return <></>
                }
            })}
        </Stack>
    </Box>
  )
}

export default Message