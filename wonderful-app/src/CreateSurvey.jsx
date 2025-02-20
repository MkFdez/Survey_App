import { Box, Button, Input, Stack } from "@chakra-ui/react"
import ComponentsDrawer from "./components/ComponentsDrawer"
import React, { useEffect} from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useDisclosure, Accordion} from "@chakra-ui/react"
import Question from "./components/Question"
import FinishSurveyAlertDialog from "./components/FinishSurveyAlertDialog"
import LoadingHamster from "./components/LoadingHamster"
import Cookies from 'js-cookie'
import axios from 'axios'
import {  reset, updateTitle } from './redux/createSurvey'
import cloneDeep from 'lodash/cloneDeep';
import gSurvey from "../utils/survey_generator"
import GenerateSurveyDialog from "./components/GenerateSurveyDialog"
import API_URL from "../config/backend"
export default function CreateSurvey(){
    const API = API_URL();
    const { isOpen:isOpenDialog, onOpen:onOpenDialog, onClose:onCloseDialog} = useDisclosure()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen:isOpenGen, onOpen:onOpenGen, onClose:onCloseGen } = useDisclosure()

    const cancelRef = React.useRef()
    const btnRef = React.useRef()
    const navigate = useNavigate()
    const imageFolder = useSelector(state =>  state.createSurvey.imageFolder)
    const isLoading = useSelector(state =>  state.createSurvey.isLoading)
    const dispatch = useDispatch()
    useEffect(() => {dispatch(reset())}, [])
    const title = useSelector(state => state.createSurvey.title)
    const questions = useSelector(state => state.createSurvey.questions)
    const questionList = questions.map((x,i) => <Question data={x} 
                                                index={i}
                                                key={i} 
                                                imageFolder={imageFolder}
                                               />)
    
    
     async function createSurvey(){
        let toUpload = []
        console.log(questions)
        let copy = cloneDeep(questions)
        for await(const x of copy) {
            x.pa = x.pa.filter(y => y.a != "")
            if(x.pa.length >= 2 && x.q != ""){
            x.pa = await Promise.all(x.pa.map( async(y,i) => {
                    if(y.t == 1){
                        
                        const formData = new FormData();
                        formData.append('id', imageFolder)
                        formData.append('image', y.a);
                        let path = await axios
                        .post(`${API}/upload`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                        })
                        .then((response) => {                                     
                        return response.data.final_path
                        })
                        console.log(i)  
                                          
                        return  {...y, a: path}
                        
                    }else{
                        return y
                    }
                }))
                console.log(x)
                toUpload.push(x)
            }


          
        }
        const obj = {
            questions : toUpload,
            title: title,
        }
        const token = 'Bearer ' + Cookies.get('token')
        const config = {
            headers: { Authorization: token },
          }
        axios.post(`${API}/api/survey`,
           obj,
           config
        ).then(({data})=> {navigate(`/survey/info/${data.id}`)})
         
    }
    
     return (
            isLoading 
            ? 
            <Box ml={'auto'} mr={'auto'} w={'min-content'} mt={'30px'}>
            <LoadingHamster /> 
            </Box>
            :

        <Stack pl={'10%'} pr={'10%'} pt={'5%'} pb={'5%'} >
            <FinishSurveyAlertDialog isOpen={isOpenDialog} onClose={onCloseDialog} onOpen={onCloseDialog} cancelRef={cancelRef} onAccept={createSurvey}/>
            <ComponentsDrawer isOpen={isOpen} onClose={onClose} btnRef={btnRef}  />
            <Input value={title} onChange={(event) => {dispatch(updateTitle(event.target.value))}} placeholder="Survey Title" ml={"auto"} mr={"auto"} w={"90%"} p={7}  fontSize={25} fontWeight={"bold"} textAlign={"center"} ></Input>
            <Accordion defaultIndex={[0]} allowMultiple>
                {questionList}
        </Accordion>
        <Button ref={btnRef} colorScheme='teal' onClick={onOpen} w={'100%'} >
                Add Question
        </Button>
        <Button  colorScheme='red'  w={'100%'} onClick={onOpenDialog} >
                Finish
        </Button>
        <Button  colorScheme='red'  w={'100%'} onClick={onOpenGen} isDisabled={true} >
                generate by IA (soon)
        </Button>
        <GenerateSurveyDialog isOpen={isOpenGen} onClose={onCloseGen} onOpen={onOpenGen} cancelRef={cancelRef} onAccept={gSurvey} />
        </Stack>
     
     )
}