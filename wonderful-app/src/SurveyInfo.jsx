import { useEffect, useState, useRef } from 'react';
import {
  Box,
  Heading,
  Text,
  Link as ChakraLink,
  Center,
  Flex,
  CircularProgress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  Collapse,
  Button,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import CopyTextComponent from './components/CopyTextComponent';
import axios from 'axios';
import RoundedImage from './components/RoundedImage';
export default function SurveyInfo() {
  const { id } = useParams();
  const [survey, setSurvey] = useState(null);
  const [questions, setQuestions] = useState([]) 
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const chartRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState('300px');

  useEffect(() => {
    const updateContainerHeight = () => {
      if(chartRef.current != null){
      const height = chartRef.current.clientHeight;
      console.log(height)
      setContainerHeight(height);
      }
    };

    window.addEventListener('resize', updateContainerHeight);
    updateContainerHeight();

    return () => {
      window.removeEventListener('resize', updateContainerHeight);
    };
  }, []);

  const chartHeight = containerHeight > 0 ? containerHeight : 300;
  var colors = [
    "#FF5252", // Red,
    "#536DFE",  // RoyalBlue
    "#FF4081", // Pink
    "#E040FB", // Purple
    "#673AB7", // DeepPurple
    "#3F51B5", // Indigo
    "#03A9F4", // LightBlue
    "#00BCD4", // Cyan
    "#009688", // Teal
    "#4CAF50", // Green
    "#8BC34A", // LimeGreen
    "#CDDC39", // Lime
    "#FFEB3B", // Yellow
    "#FFC107", // Amber
    "#FF9800", // Orange
    "#FF5722", // DeepOrange
    "#795548", // Brown
    "#9E9E9E", // Grey
    "#607D8B", // BlueGrey
    
    "#4CAF50", // Green
  ];
  
  
  useEffect(() => {
    // Fetch survey data from the server using the surveyId
    fetchSurveyData();
  }, [id]);

  const fetchSurveyData = async () => {
    try {
      const data = await axios.get('http://localhost:5000/api/survey/info', {params:{surveyId:id}})
      setSurvey(data.data);
      let q = []
      let temp = data.data.responses.map(x => x.response)
      console.log('base')
        console.log(temp)
      for(let i = 0; i < temp[0].length; i++){
        q.push(temp.map(x => x[i]))
      }
      setQuestions(q)
      console.log('q')
      console.log(q)
      
    } catch (error) {
      console.log('Error fetching survey data:', error);
    }
  };

  if (!survey) {
    return (
      <Center h="100vh">
        <CircularProgress isIndeterminate color="teal.500" />
      </Center>
    );
  }

  const link = 'http://localhost:5173/survey/'+id
  console.log(`questions ${questions}`)
  //console.log(questions)
  const participants = survey.responses.map((x,i) => `User ${i}`)
  // Count the number of participants
  const participantsCount = participants.length;

  const handleQuestionToggle = (questionId) => {
    if (selectedQuestion === questionId) {
      setSelectedQuestion(null);
    } else {
      setSelectedQuestion(questionId);
    }
  };

  const getPieChartData = (answers, i) => {
    console.log(`ana ${i}`)
    const counts = new Map();
    
    // Count the occurrences of each answer
    answers.forEach((answer) => {
      counts.set(answer, (counts.get(answer) || 0) + 1);
    });

    // Convert the answer counts to pie chart data format
    const totalAnswers = answers.length;
    const pieData = Array.from(counts, ([answer, count]) => ({
      answer: answer ,
      value: count,
      percent: ((count / totalAnswers) * 100).toFixed(0),
    }));
    console.log(pieData)
    return pieData;
  };

  const renderQuestionChart = (question, i) => {
    const pieData = getPieChartData(question, i);
    console.log(questions)
    return (
      <Box key={i}>
        <center>
        <Heading as="h2" size="md" mb={2}>
          {survey.moreData.question[i].q}
        </Heading>
        </center>
        {question.length > 0 ? (
           <Box ref={chartRef} height={'300px'} width={'100%'}>
            <ResponsiveContainer width="100%" height="100%">
            <PieChart height={300} width={400} >
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="answer"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#3182CE"
                
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} style={{outline: 'none'}} fill={colors[index]} />
                ))}
              </Pie>
              <Legend layout="vertical" verticalAlign="bottom" align="center" formatter={
                (value, entry, index) => survey.moreData.question[i].pa[index].t == 0 
                ? <span className="text-color-class">{survey.moreData.question[i].pa[index].a}</span> 
                : <RoundedImage imageUrl={'http://localhost:5000/'+survey.moreData.question[i].pa[index].a} width={'20%'} height={"20%"}/>}/>
            </PieChart>
            </ResponsiveContainer>
   
          </Box>
        ) : (
          <Text>No answers yet for this question.</Text>
        )}
      </Box>
    );
  };

  return (
    <Box p={8}>
      <Heading as="h1" mb={6} fontSize="2xl">
        Survey Details
      </Heading>
      <Box mb={6} >
        <Text fontSize="lg">
          Survey Link:{' '}
          
        
          
        </Text>
        <CopyTextComponent text={link} ></CopyTextComponent>
      </Box>
      <Grid templateColumns={{ sm: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }} gap={4} mb={6}>
        <Stat>
          <StatLabel>Total Participants</StatLabel>
          <StatNumber>{participantsCount}</StatNumber>
          <StatHelpText>Click the questions to view details</StatHelpText>
        </Stat>
      </Grid>
    {
      questions.length > 0 ?
      <>
      <Box mb={6}>
        <Flex justify="center">
          <Box p={4} borderWidth={1} borderRadius="md" >
            {
            questions.map((question, i) => (
              <Button
                key={i}
                variant={selectedQuestion === i ? 'solid' : 'outline'}
                colorScheme="teal"
                size="sm"
                onClick={() => handleQuestionToggle(i)}
                mr={2}
              >
                {`question ${i}`}
              </Button>
            ))}
          </Box>
        </Flex>
      </Box>
      <Box width="100%" overflowX="auto">
        <Flex direction="column" align="stretch">
          {questions.map((question, i) => (
            <Collapse key={i} in={selectedQuestion === i}>
              {renderQuestionChart(question, i)}
              </Collapse>
          ))}
        </Flex>
      </Box>
      </>
      :
      <center><Text>nobody has answered this survey</Text></center>
          }
    </Box>
  );
}
