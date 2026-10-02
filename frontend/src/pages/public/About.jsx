import { Box, Container, Grid, GridItem, Heading, Text } from "@chakra-ui/react";
import PageHero from "../../components/common/PageHero.jsx";
import SectionTitle from "../../components/common/SectionTitle.jsx";

export default function About() {
  return (
    <>
      <PageHero title="About Us" description="Learn about ACC Computer College, its mission, vision and academic direction." />
      <Container maxW="1280px" py={{ base: "14", md: "20" }}>
        <Grid columns={{ base: 1, md: 2 }} gap="12">
          <GridItem>
            <SectionTitle eyebrow="Who we are" title="About ACC" />
            <Text color="gray.600" lineHeight="2">
              ACC Computer College is presented as a modern technology-focused educational
              institution. This page can later be connected to the official college profile
              stored in the backend CMS.
            </Text>
          </GridItem>
          <GridItem>
            <Box bg="blue.50" borderRadius="2xl" p="8">
              <Heading size="md">Our Vision</Heading>
              <Text mt="4" color="gray.700" lineHeight="1.8">
                To support technology education, practical learning and innovation.
              </Text>
              <Heading size="md" mt="8">Our Mission</Heading>
              <Text mt="4" color="gray.700" lineHeight="1.8">
                To provide accessible, relevant and professionally oriented computer education.
              </Text>
            </Box>
          </GridItem>
        </Grid>
      </Container>
    </>
  );
}
