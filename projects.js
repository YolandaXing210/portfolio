// Edit your projects here.
// tags:  keywords shown under the title: the skills this project shows, so a reader can scan for them.
// image: path to an image (3:2 works best), or null for the wireframe placeholder.
// link:  where "Read more…" and the image go.
// theme: "aako" | "garden" | "journey" — colors the entry with its project accent.
// links: use instead of link when a project has several pages: [{ label, href }]. The image goes to the first.

const LOREM = "Etiam euismod elit id nisl lacinia commodo. Donec non neque quis mauris malesuada ultricies. Sed posuere sem velit, nec vestibulum enim laoreet. Duis imperdiet egestas pulvinar, In gravida turpis arcu, et semper nisl pellentesque est.";

window.PROJECTS = {
  selected: [
    { title: "001—AAKO", theme: "aako", tags: ["Shipped iOS app", "AR/VR", "Spatial interaction", "3D prototyping", "User research", "Product strategy", "Mobile redesign"], text: "An XR memory app, in two chapters: Echo, the 3D form a memory takes in space; and the post-launch reframe from spatial social app to spatial memory system.", image: "images/aako.png", links: [
      { label: "Read more: Echo, the 3D prototype…", href: "aako-echo.html" },
      { label: "Read more: Reframing & mobile redesign…", href: "aako-redesign.html" },
    ] },
    { title: "002— What’s in Your Bag?", theme: "garden", tags: ["Human–AI interaction", "Generative AI", "Interaction design", "Creative coding", "Physical computing"], text: "An AI-powered interactive experience that turns emotional relationships with everyday objects into generative forms and messages.", image: "images/garden.jpg", link: "garden.html" },
    { title: "003— Journey to the Forgotten", theme: "journey", tags: ["VR", "Embodied interaction", "Unity", "Spatial design", "Installation"], text: "A VR interactive installation about being watched. Resistance, ritualized motion, and attention-driven environments shift VR from mind-centric control toward physical awareness.", image: "images/journey.jpg", link: "journey.html" },
    { title: "004— Tool Gallery", tags: ["Design tools", "Creative coding", "Prototyping"], text: LOREM, image: null, link: "project.html" },
    { title: "005—TEST PROJECT", tags: ["Keyword", "Keyword", "Keyword"], text: LOREM, image: null, link: "project.html" },
  ],
};
