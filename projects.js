// Edit your projects here.
// n:     the entry's number, shown above the title in the site color.
// title: the project name, shown large in the semi-mono.
// tags:  keywords shown under the title: the skills this project shows, so a reader can scan for them.
// image: path to an image (3:2 works best), or null for the wireframe placeholder.
//        Shown as dots in the site color until hovered (script.js, "Thumbnail dots").
// link:  where "Read more…" and the image go. "?p=name" opens that panel over the list (see index.html).
// links: use instead of link when a project has several pages: [{ label, href }]. The image goes to the first.
//        A link can carry its own tags: [{ tags, label, href }], shown above it; the text then comes first.
// hidden: true keeps an entry off the page without deleting it.

const LOREM = "Etiam euismod elit id nisl lacinia commodo. Donec non neque quis mauris malesuada ultricies. Sed posuere sem velit, nec vestibulum enim laoreet. Duis imperdiet egestas pulvinar, In gravida turpis arcu, et semper nisl pellentesque est.";

window.PROJECTS = {
  selected: [
    { n: "001", title: "Aako", text: "An XR memory app, in two chapters: Echo, the 3D form a memory takes in space; and the post-launch reframe from spatial social app to spatial memory system.", image: "images/aako.png", links: [
      { tags: ["Spatial interaction", "User research", "3D prototyping"], label: "Read more: Echo, the 3D prototype…", href: "aako-echo.html" },
      { tags: ["User research", "Product strategy", "UIUX"], label: "Read more: Reframing & mobile redesign…", href: "aako-redesign.html" },
    ] },
    { n: "002", title: "What’s in Your Bag?", tags: ["Generative AI", "Interaction design", "Creative coding"], text: "An AI-powered interactive experience that turns emotional relationships with everyday objects into generative forms and messages.", image: "images/garden.jpg", link: "garden.html" },
    { n: "003", title: "Journey to the Forgotten", tags: ["Quest VR", "Embodied interaction", "Unity", "Spatial design", "Installation"], text: "A VR interactive installation about being watched. Resistance, ritualized motion, and attention-driven environments shift VR from mind-centric control toward physical awareness.", image: "images/journey.jpg", link: "journey.html" },
    { n: "004", title: "Tool Gallery", tags: ["Hackathons", "Design tools", "Games", "Creative coding"], text: "A collection of mini tools and experimental projects / art that I had done.", image: "images/tool-gallery.jpg", link: "?p=tool-gallery" },
    { n: "005", title: "Test Project", hidden: true, tags: ["Keyword", "Keyword", "Keyword"], text: LOREM, image: null, link: "project.html" },
  ],
};
