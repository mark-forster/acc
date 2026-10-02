import { Badge, Box, Container, Heading, Input, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import PageHero from "../../components/common/PageHero.jsx";

const entries = [
  { id: "ACC-2026-001", name: "Student Example", program: "Computer Science", status: "Admitted" },
  { id: "ACC-2026-002", name: "Student Example", program: "Software Engineering", status: "Admitted" },
  { id: "ACC-2026-003", name: "Student Example", program: "Network & Security", status: "Admitted" },
];

export default function EntranceList() {
  const [query, setQuery] = useState("");
  const filtered = entries.filter((item) => item.id.toLowerCase().includes(query.toLowerCase()) || item.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <PageHero title="Entrance List" description="Check the latest entrance and admission information." />
      <Container maxW="1000px" py="16">
        <VStack align="stretch" gap="7">
          <Box bg="blue.50" p="7" borderRadius="2xl">
            <Heading size="md">2026 Entrance List</Heading>
            <Text mt="2" color="gray.600">Search using an approved student identifier.</Text>
            <Input mt="5" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search student ID or name" bg="white" size="lg" />
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2 }} gap="5">
            {filtered.map((item) => (
              <Box key={item.id} borderWidth="1px" borderRadius="xl" p="6" bg="white">
                <Badge colorPalette="green">{item.status}</Badge>
                <Heading size="sm" mt="4">{item.name}</Heading>
                <Text mt="2" color="gray.600">{item.id}</Text>
                <Text color="gray.600">{item.program}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </>
  );
}
