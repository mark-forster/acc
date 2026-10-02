import { Container, Heading, SimpleGrid, Box, Text, Badge } from "@chakra-ui/react";
import PageHero from "../../components/common/PageHero.jsx";

const courses = [
  ["B.Sc. Computer Science", "4 Years", "Computer Science"],
  ["B.Sc. Software Engineering", "4 Years", "Software Engineering"],
  ["Diploma in Networking", "2 Years", "Network & Security"],
  ["Professional Web Development", "1 Year", "Professional Program"],
];

export default function Courses() {
  return (
    <>
      <PageHero title="Courses" description="Explore academic and professional courses offered by ACC." />
      <Container maxW="1280px" py="16">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="6">
          {courses.map(([name, duration, category]) => (
            <Box key={name} borderWidth="1px" borderRadius="2xl" p="7" bg="white">
              <Badge colorPalette="blue">{category}</Badge>
              <Heading size="md" mt="5">{name}</Heading>
              <Text mt="3" color="gray.600">Duration: {duration}</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    </>
  );
}
