import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Exact Real Transcript into Database...');

  // Clean the database
  await prisma.questionAnswer.deleteMany();
  await prisma.transcript.deleteMany();

  const realText = `Profile

Date:- 25/02/2026.

96/96/88 GNEM fresher 99.98%ile

P1: Entrepreneurship Domain(Male)
P2: OB and HR domain(Male)
P3: Decision sciences (Male)

Me= X

Transcript

P3 comes to the door, calls out my name ( I go in for some reason shakes hand with me ) I took my own pencil in with me ( significance of this pencil at end of interview )

I stand in front of the panel and take a seat after they say so

Transcript

P2: So, X I can see you are very keenly interested about stock markets like from class 8 when you used to watch your father and also interested in valuation of businesses

Me: Yes, sir

P2: Tell me about the small cap 50 Index valuation model that you have built.

Me: I explain, took dividend+buyback as proxy for FCFE according to damodran sir's approach, took a historical growth rate as forward looking growth rates are usually derived by institutions and used CAPM model for Cost of Equity

P2: Can this model work for international indices and index like nifty 50

Me: I say yes sir, infact it will work even better for Nifty 50 as Nifty 50 companies are more mature and have higher dividend yield so FCFE is very close to dividend+buybacks.

P2: what is annual CAGR of Nifty 50

Me: 12% sir usually nobody questions that estimate ( i say in a smiling way )

P2: After Covid19 what is the growth

Me: I say Nifty 50 dropped to 8000 points during covid and today stands at 25600 so around 200% total growth

P2: What are recent developments in stock markets

Me: I say about recent increase in futures and options STT from hike(he double checked the numbers) and progressive increase in lot size of options to save retail from losses.

P2: If i were to invest, what would you recommend dividend or growth stocks

Me: I would need more information about your other commitments and goals sir

P2: I just want capital appreciation

Me: Then sir growth stocks in form of small caps would be best

P2 : what is largest stock exchange ? Rank of India ? Smallest stock exchange ?

Me: Largest is NYSE, India last i checked was at 10 ( it is 5 or 8 now...different website different results ) , smallest I dont know sir

P3 takes over

P3: X In which cases DCF valuation is not applicable

Me: Sir if a company is loss making with negative cash flows then it is difficult.

P3: So how would you value openAI 3-4 years back

Me: Sir we will look for relative valuation. I ask if we have any comparable company or Comparable transaction in the space

P3: He says Open AI is the industry so nothing is there

Me: Sir as we dont have CCA or CTA and book value methods will not work here. We have to use a Modified DCF model where we will have to research about growth estimates of AI sector and find when will company turn profitable with respect to cash flows and we will also add a small size premium to account to increased risk in CAPM model.

P3: X I can also see you are from a Airforce background ( my father is ex serviceman )

Me: I say yes sir, but I was 3 years old when he retired, so like I know the basics but not much inclined towards that

P3: I can also see your brother is an MBA from prominent institution didnt you or He ever try for armed forces

Me: Sir my brother had tried he gave 5 SSB's out of which he reached in interview stage for 2 of them but unfortunately couldnt clear. As far as I am concerned I was interested in finance domain so didnt try and there was also no pressure from my family to pursue it

FROM HERE INTERVIEW TOOK A DRASTIC TURN

P3: X you didnt even try for armed forces. I believe you dont have any patriotic fervour ( who questions patriotism towards own country 😭 )

Me: Sir I believe not right to say that ( said in a very polite tone ), actually I have been interested in this domain and also my physique is also not that great so as to try.

P1 takes over

P1: but physique can be built . Leave it , you said you invest in stock market . Have you made profit or loss you are allowed not say that as it is private matter

Me : I say sir I started in 2024 ..cutt

P1: Loss or Profit ?

by now recognized it is going to stress domain so tried to consciously smile

Me: Sir in loss, but easily recoverable.

P1: Is your father in profit or loss again you may wish to stay silent on that

Me: I say sir he is a very profitable person

P1: X from what I can recognize is that you are just a gambler who wishes to make money quickly by telling big big things like growth and risk but not talk anything about product and all ( gave a 1 minute monologue)

Me: Sir I believe stock markets are not gambling, Revenues are in front of us, Profits and Cash flows are in front of us, Product is also in front of us. So equities are not gambling I believe. Yeah I would agree on futures and options being that as even my father had tried that during Initial days but realized it soon so he also cautions me against that.

P1: You have made a loss so you are a gambler is what just I can see

Me: I said sir since I started investing Trump's policies have been erratic which no one can predict and when markets fall due to this even if it is a value stock or not everything gets beaten down and said sir it would be a wrong conclusion even warren buffet has himself said that berkshire hathway fell by more than 50% three times during his investment tenure. Definitely I could have made mistakes but it should be 2-3 outliers.

P1: He is a professional gambler. Do you know about Rakesh jhunjhunwala ?

Me: Yes sir a bear who made money by shorting stocks in 1990's and turned into a long term investor later and his prominent investment is titan in which he invested at single digits. Today its worth more than 4000.

P1: Do you know what he said at end of his life ?

Me: I dont know ( later I checked he said money is not important , family and happiness is important ...but the fallacy of argument is that we know all this because HE WAS RICH.)

P1: X how much money you want to earn ?

Me: I never thought of it sir

P1: What will you do with so much money

Me: I dont know sir

P1: You just want to make quick money by this finance and stuff and dont provide and value.IIMB doesnt have any shares listed but it still works then why even invest in stock market, instead build some product of use

Me : Sir IIMB it receives grants from govt...cutt

P1: We dont receive any grants ( later checked yes they dont they are now big enough to be autonomous )

Me: Sir then it also receives fees and donations

P1: BECAUSE WE PROVIDE VALUE.Have You come to IIMB or IIMB has come to you ?

Me: Yes sir I have come to IIMB but exactly sir as you said value, In finance , valuation analysts provide value to VC's so that they can make investments into companies requiring capital so that they can develop their products as entrepreneurs wont always have all the funds.

P1: Why you want Valuation

Me: X, sir I have always been interested in this domain and wanted to do something here. I have also worked to improve my skills here and in addition to that I also like numbers and also father of Modern Valuation Aswath Damodran sir is himself a IIMB alumni of batch of 1979

P1: Aswath Damodran was a mistake of IIMB. Should we make same mistake by taking you ? Also you like numbers , so go become a mathematician.

Me: I said sir I am a non math commerce student so becoming mathematician wouldnt not be allowed as such.( Thought would shift to asking QA questions i had 99.94 , it was a strength but I was wrong ).

P1: Everything is possible go do a bridge course. Leave it , what other things you do.

Me: Sir I read a little bit of books

P1: Oh so you read every book little little ( Mocked me )

Me: No sir I meant to say that I havent read a lot of books but quite a few books like Amish Ramchandra series and shiva trilogy. Currenly reading man called ove by fredrik backman

P1: You have read Valmiki Ramayana ?

Me: No sir,

P1: eh, you have read what kind of books amish vamish but not read this. Alright any questions for us

Me : Yes sir how can a fresher cope up at IIMB given cutt

P1: only one question

Me: yes sir, how can fresher cope up at IIMB given their huge weight to people with workex

P3: IIMA and IIMC dont have people with workex ?

Me: Yes sir , they do but relatively less compared to B

P1: We only take people with Work ex

Me: I politely deny saying sir I have researched about institute and last year has 15% freshers.

Ok X you can leave

I say sorry sir ( came out Instinctively)

They ask why are you sorry ( rhetorical )

As I was leaving I took my pencil and was walking

P1: WHY are you taking our pencil

P2 and P3: Sir its his pencil only, he only bought it.

I again say sorry sir and I leave.

( Had to force a smile through out P1 bashing me🥲)

EDIT(on 20th April)

Verdict : Converted in First List`;

  const t1 = await prisma.transcript.create({
    data: {
      collegeId: 'iimb',
      category: 'General',
      gradField: 'Non-Engineer', // GNEM
      gender: 'Male',
      catPercentile: 99.98,
      panelSize: 3,
      date: new Date('2026-02-25'),
      verdict: 'Converted',
      anonymous: false,
      contactInfo: 'reddit.com/u/candidateX',
      fullText: realText
    }
  });

  console.log('Database seeded perfectly!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
