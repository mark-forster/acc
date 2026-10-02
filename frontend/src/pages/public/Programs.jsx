import { Box, Button, Container, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import PageHero from "../../components/common/PageHero.jsx";

const programs = [
  ["Computer Science", "Programming, algorithms, databases, systems and computer science fundamentals."],
  ["Software Engineering", "Software architecture, development lifecycle, testing and project delivery."],
  ["Network & Security", "Networking, infrastructure, security concepts and practical administration."],
  ["Web Development", "Modern frontend, backend, API and full-stack web development."],
];

export default function Programs() {
  return (
    <>
      <PageHero title="Programs" description="Academic and professional programs designed for technology-focused learning." />
      <Container maxW="1280px" py="16">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="6">
          {programs.map(([title, description]) => (
            <Box key={title} p="8" borderWidth="1px" borderRadius="2xl" bg="white">
              <Heading size="md">{title}</Heading>
              <Text mt="4" color="gray.600" lineHeight="1.8">{description}</Text>
              <Button as={RouterLink} to="/academic/courses" mt="6" variant="outline">
                View Courses
              </Button>
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    </>
  );
}
