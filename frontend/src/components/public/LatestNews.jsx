import { useEffect, useState } from "react";
import { Badge, Box, Container, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import api from "../../api/api.js";
import SectionTitle from "../common/SectionTitle.jsx";

const mockNews = [
  { _id: "1", title: "2026 Academic Year Announcement", category: "Academic", description: "Important information for the upcoming academic year.", date: "2026-10-01" },
  { _id: "2", title: "New Computer Science Program", category: "Programs", description: "Explore the latest academic opportunities at ACC.", date: "2026-09-25" },
  { _id: "3", title: "Entrance Information", category: "Admission", description: "Entrance-related announcements and information.", date: "2026-09-18" },
];

export default function LatestNews() {
  const [news, setNews] = useState(mockNews);

  useEffect(() => {
    let active = true;

    async function fetchNews() {
      try {
        const response = await api.get("/news");
        const data = response.data?.data;
        if (active && Array.isArray(data) && data.length) {
          setNews(data);
        }
      } catch {
        // The starter project intentionally falls back to mock data until the backend is connected.
      }
    }

    fetchNews();
    return () => {
      active = false;
    };
  }, []);

  return (
    <Box py={{ base: "14", md: "20" }} bg="white">
      <Container maxW="1280px">
        <SectionTitle
          eyebrow="Stay informed"
          title="Latest News"
          description="Announcements, academic updates and important information from ACC."
        />

        <SimpleGrid columns={{ base: 1, md: 3 }} gap="6">
          {news.map((item) => (
            <Box key={item._id} borderWidth="1px" borderColor="gray.200" borderRadius="2xl" p="7" bg="white" _hover={{ boxShadow: "lg", transform: "translateY(-3px)" }} transition="all .2s">
              <Badge colorPalette="blue">{item.category}</Badge>
              <Heading size="md" mt="5" lineHeight="1.4">{item.title}</Heading>
              <Text mt="3" color="gray.600" lineHeight="1.7">{item.description}</Text>
              <Text mt="5" fontSize="sm" color="gray.400">{item.date}</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
