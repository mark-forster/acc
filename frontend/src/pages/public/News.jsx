import { Badge, Box, Container, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import PageHero from "../../components/common/PageHero.jsx";

const news = [
  ["2026 Academic Year Announcement", "Academic", "Important information for the upcoming academic year."],
  ["New Computer Science Program", "Programs", "Explore the latest academic opportunities at ACC."],
  ["Entrance Information", "Admission", "Entrance-related announcements and information."],
  ["Technology Workshop", "Events", "A practical workshop for students and technology enthusiasts."],
  ["Collaboration Update", "Collaboration", "New partnership and collaboration information."],
  ["Student Activities", "Student Life", "Highlights from recent student activities."],
];

export default function News() {
  return (
    <>
      <PageHero title="News & Announcements" description="Latest news, announcements and important college updates." />
      <Container maxW="1280px" py="16">
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="6">
          {news.map(([title, category, description]) => (
            <Box key={title} borderWidth="1px" borderRadius="2xl" p="7" bg="white">
              <Badge colorPalette="blue">{category}</Badge>
              <Heading size="md" mt="5">{title}</Heading>
              <Text mt="3" color="gray.600" lineHeight="1.8">{description}</Text>
              <Text mt="5" fontSize="sm" color="gray.400">Published recently</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    </>
  );
}
