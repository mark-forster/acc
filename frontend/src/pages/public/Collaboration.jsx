import { Box, Container, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import PageHero from "../../components/common/PageHero.jsx";

const partners = [
  ["Partner University", "University Partner"],
  ["Technology Company", "Industry Partner"],
  ["Training Organization", "Professional Partner"],
  ["International Institution", "International Partner"],
];

export default function Collaboration() {
  return (
    <>
      <PageHero title="Collaboration" description="University, industry and professional collaboration opportunities." />
      <Container maxW="1280px" py="16">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="6">
          {partners.map(([name, type]) => (
            <Box key={name} p="8" borderWidth="1px" borderRadius="2xl" bg="white">
              <Box w="16" h="16" borderRadius="xl" bg="gray.100" display="grid" placeItems="center" fontWeight="900">LOGO</Box>
              <Heading size="md" mt="6">{name}</Heading>
              <Text mt="2" color="gray.500">{type}</Text>
              <Text mt="4" color="gray.600" lineHeight="1.7">
                Partnership details can be managed from the future administration dashboard.
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    </>
  );
}
