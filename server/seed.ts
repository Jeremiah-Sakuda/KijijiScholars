import { db } from "./db";
import { storage } from "./storage";
import { scrapeIEFAScholarships, getKenyanFocusedScholarships, transformIEFAToScholarship } from "./iefaScraper";
import { searchUniversities, transformScorecardToUniversity } from "./collegeScorecard";

async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  try {
    // Seed scholarships
    console.log("📚 Seeding scholarships...");
    
    // Get IEFA sample scholarships
    const iefaScholarships = await scrapeIEFAScholarships({});
    console.log(`  Found ${iefaScholarships.length} IEFA scholarships`);
    
    for (const iefaScholarship of iefaScholarships) {
      const scholarshipData = transformIEFAToScholarship(iefaScholarship);
      await storage.upsertScholarship(scholarshipData);
    }
    
    // Get Kenyan-focused scholarships
    const kenyanScholarships = getKenyanFocusedScholarships();
    console.log(`  Found ${kenyanScholarships.length} Kenyan-focused scholarships`);
    
    for (const kenyanScholarship of kenyanScholarships) {
      const scholarshipData = transformIEFAToScholarship(kenyanScholarship as any);
      await storage.upsertScholarship(scholarshipData);
    }
    
    const totalScholarships = await db.execute("SELECT COUNT(*) as count FROM scholarships");
    console.log(`  ✅ Scholarships seeded: ${(totalScholarships.rows[0] as any).count} total`);

    // Seed universities from College Scorecard
    console.log("🎓 Seeding universities from College Scorecard...");
    
    // Search for top universities
    const searchTerms = [
      "Harvard", "Stanford", "MIT", "Yale", "Princeton",
      "Columbia", "University of Pennsylvania", "Duke", "Cornell",
      "Northwestern", "University of California", "University of Michigan"
    ];
    
    let universitiesAdded = 0;
    for (const searchTerm of searchTerms) {
      try {
        const results = await searchUniversities({
          name: searchTerm,
          perPage: 5,
        });
        
        if (results.results.length > 0) {
          for (const school of results.results) {
            const universityData = transformScorecardToUniversity(school);
            await storage.upsertUniversity(universityData);
            universitiesAdded++;
          }
        }
        
        // Small delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`  ⚠️  Error searching for ${searchTerm}:`, error);
      }
    }
    
    const totalUniversities = await db.execute("SELECT COUNT(*) as count FROM universities");
    console.log(`  ✅ Universities seeded: ${(totalUniversities.rows[0] as any).count} total`);

    console.log("✨ Database seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
