import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Real Transcripts into Database...');

  // IIM Bangalore Real Equivalent
  const t1 = await prisma.transcript.create({
    data: {
      collegeId: 'iimb',
      category: 'General',
      gradField: 'Engineer',
      gender: 'Male',
      catPercentile: 99.85,
      panelSize: 3,
      date: new Date('2024-03-02'),
      verdict: 'Converted',
      anonymous: false,
      contactInfo: 'linkedin.com/in/realcandidate1',
      questions: {
        create: [
          { q: 'What is your current role at your software firm?', a: 'I lead a team of 4 managing the backend orchestration using Kubernetes for our primary microservices.' },
          { q: 'Why MBA if you are already handling such technical complexity?', a: 'I want to transition from purely technical execution to strategic product management, taking ownership of the KPIs rather than just system uptime.' },
          { q: 'What is the revenue model of an open-core company like GitLab?', a: 'Explained the freemium model alongside enterprise licensing for advanced security and compliance features.' },
          { q: 'Explain a time you had a conflict with your manager.', a: 'Narrated an instance where we disagreed on a deployment timeline. We solved it by documenting the technical debt risk which aligned our perspectives.' }
        ]
      }
    }
  });

  // IIM Ahmedabad Real Equivalent
  const t2 = await prisma.transcript.create({
    data: {
      collegeId: 'iima',
      category: 'OBC',
      gradField: 'Other', // B.Arch
      gender: 'Female',
      catPercentile: 97.2,
      panelSize: 2,
      date: new Date('2024-02-15'),
      verdict: 'Converted',
      anonymous: true,
      questions: {
        create: [
          { q: 'You are an architect. Why shift to business management?', a: 'Architecture taught me design thinking and spacial management, but I realized the real bottlenecks are often in project financing and real estate strategy. An MBA bridges this gap.' },
          { q: 'Draw a rough floor plan of this very interview room. (Given a piece of paper)', a: '(Drew a scaled representation outlining the desks, camera positions, and windows. Panel seemed impressed.)' },
          { q: 'What is the current Repo Rate and how does it affect real estate?', a: 'Current repo rate is 6.5%. An increase makes home loans expensive, which suppresses demand in the real estate housing sector.' }
        ]
      }
    }
  });

  // IIM Calcutta Finance heavy Real Equivalent
  const t3 = await prisma.transcript.create({
    data: {
      collegeId: 'iimc',
      category: 'General',
      gradField: 'Commerce',
      gender: 'Male',
      catPercentile: 99.4,
      panelSize: 3,
      date: new Date('2024-03-10'),
      verdict: 'Waitlisted',
      anonymous: true,
      questions: {
        create: [
          { q: 'Walk me through your resume.', a: 'Focus shifted quickly to my articleship experience doing statutory audits for manufacturing firms.' },
          { q: 'How would you value a steel company?', a: 'Mentioned DCF but highlighted that Asset-based valuation or EV/EBITDA multiples are more appropriate given the capital intensive nature.' },
          { q: 'Wait, what if the steel prices are extremely volatile?', a: 'We would look at normalized earnings over a business cycle rather than a single year TTM.' },
          { q: 'Tell me a non-academic book you read recently.', a: '"Thinking, Fast and Slow" by Daniel Kahneman. Explained System 1 and System 2 thinking with a short example.' }
        ]
      }
    }
  });

  // FMS Delhi
  const t4 = await prisma.transcript.create({
    data: {
      collegeId: 'fms',
      category: 'General',
      gradField: 'Engineer',
      gender: 'Female',
      catPercentile: 99.7,
      panelSize: 2,
      date: new Date('2024-04-05'),
      verdict: 'Converted',
      anonymous: false,
      contactInfo: 'email@example.com',
      questions: {
        create: [
          { q: 'Why FMS over IIMs?', a: 'The ROI is unbeatable, and being in the heart of Delhi provides incredible corporate access. Also, the alumni network in marketing is stellar.' },
          { q: 'Extempore Topic: "Red vs Blue"', a: 'Spoke for 1 minute on how it represents political divides (US elections), sports rivalries (Manchester derby), and brand wars (Coke vs Pepsi). Used a structured approach.' },
          { q: 'You scored low in your 12th standard. Any reason?', a: 'I had a prolonged illness during the board exams. I bounced back in my engineering which is reflected in my 9.2 CGPA.' }
        ]
      }
    }
  });

  console.log('Database seeded successfully!', { t1: t1.id, t2: t2.id, t3: t3.id, t4: t4.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
