import { Box, Container, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import PageHero from "../../components/common/PageHero.jsx";

const people = [
  ["Dr. Aung Aung", "Professor", "Computer Science"],
  ["Daw Su Su", "Lecturer", "Software Engineering"],
  ["U Mg Mg", "Instructor", "Network & Security"],
  ["Daw Mya Mya", "Administrative Officer", "Administration"],
];

export default function FacultyStaff() {
  return (
    <>
      <PageHero title="Faculties & Staff" description="Meet the academic and administrative team at ACC." />
      <Container maxW="1280px" py="16">
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="6">
          {people.map(([name, position, department]) => (
            <Box key={name} borderWidth="1px" borderRadius="2xl" p="6" bg="white">
              <Box h="180px" borderRadius="xl" bg="gray.100" display="grid" placeItems="center" color="gray.400" fontWeight="800">
                PHOTO
              </Box>
              <Heading size="md" mt="5">{name}</Heading>
              <Text mt="2" color="blue.600" fontWeight="700">{position}</Text>
              <Text mt="1" color="gray.500">{department}</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    </>
  );
}
