import { Box, Button, Container, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import SectionTitle from "../common/SectionTitle.jsx";

const programs = [
  { title: "Computer Science", description: "Foundations of programming, algorithms, systems and software development." },
  { title: "Software Engineering", description: "Professional software design, development, testing and delivery." },
  { title: "Network & Security", description: "Networking, infrastructure, security principles and practical administration." },
];

export default function Programs() {
  return (
    <Box py={{ base: "14", md: "20" }} bg="gray.50">
      <Container maxW="1280px">
        <SectionTitle
          eyebrow="Academic"
          title="Programs"
          description="Discover programs designed to build practical and professional technology skills."
        />

        <SimpleGrid columns={{ base: 1, md: 3 }} gap="6">
          {programs.map((program) => (
            <Box key={program.title} p="8" borderWidth="1px" borderColor="gray.200" borderRadius="2xl" bg="white">
              <Box w="12" h="12" borderRadius="xl" bg="blue.50" color="blue.600" display="grid" placeItems="center" fontWeight="900">
                {program.title.charAt(0)}
              </Box>
              <Heading size="md" mt="6">{program.title}</Heading>
              <Text mt="3" color="gray.600" lineHeight="1.8">{program.description}</Text>
              <Button as={RouterLink} to="/programs" mt="6" variant="outline">
                View Program
              </Button>
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
