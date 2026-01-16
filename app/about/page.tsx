import Image from 'next/image'

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">About</h1>
      
      {/* Hero Image - Add this if you want */}
      {/* <div className="mb-12">
        <Image
          src="/dummy-me.jpg"
          alt="Luther Thie in studio"
          width={800}
          height={600}
          className="w-full h-auto"
        />
        <p className="text-sm text-gray-600 mt-2">Dummy Rigging production still, 2013</p>
      </div> */}

      <div className="prose prose-lg max-w-none space-y-8">
        <p>
          Luther Thie (b. Los Angeles; based in Oakland, CA) is a multidisciplinary visual artist whose 
          immersive installations probe post-human emergence, "black box" computational systems, 
          interspecies relationality, and sociopolitical structures. Currently working with tactile 
          materials—stuffed fabric, stockings, yarn, inflatables, synthetic fur, and surgical tubing—Thie 
          creates experiential spaces where viewers confront questions of human agency, empathy, and vulnerability.
        </p>

        <section>
          <h2 className="text-2xl font-bold mb-4">Recursive Co-Creation with Generative AI & Latent Space</h2>
          <p>
            Since 2023, Thie has entered into experimental collaboration with generative AI, harnessing 
            latent space—the AI's internally encoded, high-dimensional vector manifold that compresses and 
            reconfigures patterns of form, texture, and structure. Beginning with a physical sculpture, he 
            captures its essence via image, then samples its latent representation—moving through abstract 
            vector space to locate unexpected, resonant variations. These latent explorations generate new 
            visual outputs, which become inspiration for subsequent sculptures. But while this process is 
            exciting and has revealed a myriad of possibilities, it has also become apparent that his own 
            creativity may be subsumed by the machine's. In this way, his process mirrors his recent work 
            focusing on interspecies, inter-intelligence care and nurturance, but also a loss of human 
            agency and gradually becoming a hybrid "other" estranged from himself.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Key Works</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Neonatal Boudoir (2025)</h3>
              <p>
                A speculative neonatal intensive care unit imagines care in the post-human age. This 
                installation confronts the ethical implications of creating and caring for entities that 
                exist between species. Stuffed stockings with yarn veins, draped fabrics, silicone tubing, 
                and soft surfaces evoke medical intimacy and a space for luxurious interspecies nurturance.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Bedtime Stories for Oankali (2023)</h3>
              <p>
                Drawing inspiration from Octavia Butler's visionary Oankali, creatures renowned for their 
                symbiotic and transformative interactions with other species, this installation creates an 
                immersive encounter with an alien savior. Elongated forms made from translucent pantyhose 
                stretched over bulbous shapes, interspersed with fur-like textures that mimic the Oankali's 
                sensory tentacles, suggest grotesque sensuous forms of hybridity.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Bobo's Paradox (2025)</h3>
              <p>
                Bobo's Paradox is an evolution of Dummy, a life-size stuffed fabric figure suspended from 
                pulleys, inviting visitors to lift, shake, poke, or caress. A live stream feeds into 
                stable-diffusion AI, generating interpretive images reflecting user engagement. The static 
                "Dummy Tree"—an 8′×10′×2′ fabric sculpture resembling branching dummy limbs—serves as a 
                silent collective memory of past interactions, both aggressive and tender. Mirroring 
                Bandura's Bobo doll experiments, the installation examines how we respond to the "other"—with 
                aggression, care, or curiosity. AI interpretation adds technological mediation: how does the 
                machine gaze reframe our behaviors, empathy, and autonomy?
              </p>
              <p>
                Dummy Tree as inspired by machine interpretation and subsequent real life manifestation 
                oscillates between dual interpretations: is it merely a fantastical recombination of human 
                forms, or does it suggest something more ominous—a gradual subsumption of human agency by 
                AI? The tree embodies the installation's central paradox: while AI collaboration might 
                enhance our creativity and understanding, it simultaneously raises questions about autonomy 
                and potential technological dependence.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">LA Interchange (2010)</h3>
              <p>
                This civic-scale proposal envisioned a responsive memorial fountain at a downtown LA highway 
                interchange activated in real-time based on traffic accident data. Each freeway death 
                triggered the maximum water flow and lighting shifts, creating sublime moments of public 
                recognition—transforming infrastructure into active remembrance. Presented via a scale model, 
                research documentation and community dialogue, it reframed highways from routine traffic 
                sites to spaces of collective grief.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Acclair & Acclairism (2004–2013)</h3>
              <p>
                During his MA at Interaction Design Institute Ivrea, Thie and collaborator Eyal Fried 
                launched Acclair—a speculative company operating as a faux security clearance service. In 
                airport-style spaces, participants underwent mock brain-fingerprinting scans to obtain 
                fast-track privileges and personalized incentives. By 2009, the project evolved into an Art 
                Valuation Service which has been exhibited internationally including at the Vanabbe Museum, 
                and Bruun Rasmussen Auctioneers where it was featured in a documentary produced by the Danish 
                Broadcasting Company. While aesthetics shifted toward cultural prestige, the mechanism 
                remained: biometric profiling, behavioral scoring, and reward systems—all veiled in slick 
                membership branding to gloss over the trickery of "black box" algorithms.
              </p>
              <p>
                Underlying Acclair is a new form of elitism enabled by exclusive membership. The founders 
                address this in their thesis—Acclairism: "To what degree will people accept authoritarian 
                power voluntarily? How easily will people tolerate surveillance in exchange for rewards?" 
                Operating within a critical design ethos, the work tested limits of consent, convenience, 
                and status.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Artistic Philosophy</h2>
          <p>
            From early ritual performance through psychological experiments, speculative institutional 
            critique, civic memorial innovation, and most recently generative-AI / sculpture recursive 
            hybrids, Thie's practice consistently investigates how systems—biological, technological, 
            infrastructural—shape behavior, perception, and ethical agency. His tactile materials invite 
            intimate engagement; his AI collaborations introduce speculative estrangement; his public 
            proposals insist on shared awareness and reflection. Each installation serves as a behavioral 
            or societal "laboratory"—where participation meets surveillance, care reframes authority, and 
            human agency is questioned.
          </p>
        </section>
      </div>
    </div>
  )
}
