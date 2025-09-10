const products = [
    // Home Decor
    {
        id: 1,
        name: "Hand-Carved Wooden Bowl",
        category: "Home Decor",
        price: "$55.00",
        seller: "Wood & Grain Studio",
        sellerLink: "#",
        description: "Each of these bowls is a unique work of art, hand-carved by our skilled artisans from a single piece of sustainable walnut wood. The rich, dark grain of the wood is brought to life with a smooth, polished finish, making it a stunning centerpiece for your table or a beautiful way to serve your favorite dishes. As each bowl is handmade, expect slight variations in size and grain, which adds to its one-of-a-kind charm.",
        images: [
            "https://placehold.co/600x600/b8b8b8/ffffff?text=Product+1+Main",
            "https://placehold.co/600x600/e0d9cf/6b584d?text=Product+1+Shot+2",
            "https://placehold.co/600x600/a2a2a2/ffffff?text=Product+1+Detail"
        ],
        customizable: true,
        customOptions: ["Light Wood Finish", "Dark Wood Finish", "Personalized Engraving"]
    },
    {
        id: 2,
        name: "Embroidered Throw Pillow",
        category: "Home Decor",
        price: "$45.00",
        seller: "Stitch & Thread",
        sellerLink: "#",
        description: "Add a touch of handcrafted elegance to your home with this beautiful linen throw pillow. The delicate floral embroidery is stitched by hand, creating a timeless design that will complement any decor. The soft, natural linen fabric is both comfortable and durable, making it perfect for everyday use. This pillow is a simple way to bring a touch of artisanal charm to your living room or bedroom.",
        images: [
            "https://placehold.co/600x600/b8b8b8/ffffff?text=Product+3+Main",
            "https://placehold.co/600x600/e0d9cf/6b584d?text=Product+3+Shot+2",
            "https://placehold.co/600x600/a2a2a2/ffffff?text=Product+3+Detail"
        ],
        customizable: false
    },
    {
        id: 3,
        name: "Ceramic Vase",
        category: "Home Decor",
        price: "$85.00",
        seller: "Clay & Co.",
        sellerLink: "#",
        description: "This tall, elegant ceramic vase is a statement piece that will add a touch of modern artistry to any room. The unique textured surface is created by hand, so no two vases are exactly alike. It's the perfect vessel for a single dramatic stem or a full bouquet of your favorite flowers. Even on its own, this vase is a beautiful object that will be admired for years to come.",
        images: [
            "https://placehold.co/600x600/f0f0f0/333333?text=Vase",
            "https://placehold.co/600x600/d8d8d8/4a4a4a?text=Vase+Side",
            "https://placehold.co/600x600/c2c2c2/555555?text=Vase+Detail"
        ],
        customizable: false
    },
    // Pottery
    {
        id: 4,
        name: "Ceramic Coffee Mug",
        category: "Pottery",
        price: "$28.00",
        seller: "Clay & Co.",
        sellerLink: "#",
        description: "Start your day with a touch of rustic charm with this handmade ceramic coffee mug. The beautiful speckled glaze is unique to each mug, a result of the hand-dipped glazing process. The comfortable handle and generous size make it the perfect mug for your morning coffee or evening tea. It's also dishwasher and microwave safe, making it as practical as it is beautiful.",
        images: [
            "https://placehold.co/600x600/b8b8b8/ffffff?text=Product+2+Main",
            "https://placehold.co/600x600/e0d9cf/6b584d?text=Product+2+Shot+2",
            "https://placehold.co/600x600/a2a2a2/ffffff?text=Product+2+Detail"
        ],
        customizable: true,
        customOptions: ["Ocean Blue Glaze", "Forest Green Glaze", "Matte White Glaze"]
    },
    {
        id: 5,
        name: "Hand-Painted Dinner Plate",
        category: "Pottery",
        price: "$40.00",
        seller: "The Pottery Barn",
        sellerLink: "#",
        description: "Elevate your everyday meals with this stylish and durable hand-painted dinner plate. The subtle floral pattern is painted by hand, making each plate a unique piece of art. Made from high-fired stoneware, this plate is built to last and is safe for daily use in the dishwasher and microwave. It's a simple way to add a touch of elegance to your dining table.",
        images: [
            "https://placehold.co/600x600/f0f0f0/333333?text=Plate",
            "https://placehold.co/600x600/d8d8d8/4a4a4a?text=Plate+Detail",
            "https://placehold.co/600x600/c2c2c2/555555?text=Plate+Set"
        ],
        customizable: false
    },
    {
        id: 6,
        name: "Textured Serving Bowl",
        category: "Pottery",
        price: "$65.00",
        seller: "Clay & Co.",
        sellerLink: "#",
        description: "This large serving bowl is perfect for family dinners, parties, or as a stunning centerpiece for your table. The unique ridged texture on the exterior is created by hand, while the smooth, food-safe glaze on the interior makes it perfect for serving salads, fruits, or your favorite dishes. This bowl is a beautiful and practical addition to any kitchen.",
        images: [
            "https://placehold.co/600x600/b8b8b8/ffffff?text=Serving+Bowl",
            "https://placehold.co/600x600/e0d9cf/6b584d?text=Bowl+Texture",
            "https://placehold.co/600x600/a2a2a2/ffffff?text=Bowl+Detail"
        ],
        customizable: false
    },
    // Textiles
    {
        id: 7,
        name: "Handwoven Jute Rug",
        category: "Textiles",
        price: "$150.00",
        seller: "Woven Wonders",
        sellerLink: "#",
        description: "Bring a touch of natural beauty to your home with this eco-friendly handwoven jute rug. The rustic texture and natural color of the jute fibers will complement any room, from a modern living room to a cozy bedroom. Each rug is handwoven by our skilled artisans, so you can be sure that you are getting a one-of-a-kind piece. Jute is a sustainable and durable material, so you can enjoy your rug for years to come.",
        images: [
            "https://placehold.co/600x600/f0f0f0/333333?text=Rug",
            "https://placehold.co/600x600/d8d8d8/4a4a4a?text=Rug+Texture",
            "https://placehold.co/600x600/c2c2c2/555555?text=Rug+Detail"
        ],
        customizable: false
    },
    {
        id: 8,
        name: "Silk Scarf",
        category: "Textiles",
        price: "$95.00",
        seller: "The Silk Weaver",
        sellerLink: "#",
        description: "This soft and luxurious silk scarf is the perfect accessory for any occasion. The beautiful pattern is created by hand using a traditional dyeing technique, making each scarf a unique work of art. The lightweight silk fabric is soft to the touch and drapes beautifully. It's the perfect way to add a touch of elegance and color to any outfit.",
        images: [
            "https://placehold.co/600x600/b8b8b8/ffffff?text=Scarf",
            "https://placehold.co/600x600/e0d9cf/6b584d?text=Scarf+Texture",
            "https://placehold.co/600x600/a2a2a2/ffffff?text=Scarf+Detail"
        ],
        customizable: false
    },
    {
        id: 9,
        name: "Patchwork Quilt",
        category: "Textiles",
        price: "$220.00",
        seller: "Granny's Quilts",
        sellerLink: "#",
        description: "This cozy and colorful patchwork quilt is a true heirloom piece. Each square is hand-stitched with care from a mix of cotton and flannel fabrics, creating a unique and beautiful design. It's the perfect quilt to snuggle up with on a cold night or to add a touch of vintage charm to your bedroom. This quilt is a work of art that will be cherished for generations to come.",
        images: [
            "https://placehold.co/600x600/f0f0f0/333333?text=Quilt",
            "https://placehold.co/600x600/d8d8d8/4a4a4a?text=Quilt+Pattern",
            "https://placehold.co/600x600/c2c2c2/555555?text=Quilt+Detail"
        ],
        customizable: true,
        customOptions: ["Choose Your Colors", "Add a Name", "Custom Size"]
    },
    // Jewelry
    {
        id: 10,
        name: "Sterling Silver Earrings",
        category: "Jewelry",
        price: "$65.00",
        seller: "Gemstone Grace",
        sellerLink: "#",
        description: "These elegant dangle earrings are the perfect accessory for everyday wear. They are made from polished sterling silver and feature a small, natural aquamarine stone. The lightweight design makes them comfortable to wear all day long. These earrings are a simple and beautiful way to add a touch of elegance to any outfit.",
        images: [
            "https://placehold.co/600x600/b8b8b8/ffffff?text=Product+6+Main",
            "https://placehold.co/600x600/e0d9cf/6b584d?text=Product+6+Shot+2",
            "https://placehold.co/600x600/a2a2a2/ffffff?text=Product+6+Detail"
        ],
        customizable: false
    },
    {
        id: 11,
        name: "Handcrafted Silver Necklace",
        category: "Jewelry",
        price: "$85.00",
        seller: "Silver & Stone Co.",
        sellerLink: "#",
        description: "This delicate silver necklace is a timeless piece that you will cherish for years to come. The small, hand-polished pendant hangs from a delicate silver chain. The minimalist design is perfect for everyday wear, but it's also elegant enough for a special occasion. This necklace is a beautiful and thoughtful gift for someone special.",
        images: [
            "https://placehold.co/600x600/f0f0f0/333333?text=Necklace",
            "https://placehold.co/600x600/d8d8d8/4a4a4a?text=Necklace+Detail",
            "https://placehold.co/600x600/c2c2c2/555555?text=Necklace+Close-up"
        ],
        customizable: true,
        customOptions: ["Choose Chain Length", "Engrave Initials"]
    },
    {
        id: 12,
        name: "Gemstone Ring",
        category: "Jewelry",
        price: "$120.00",
        seller: "Gemstone Grace",
        sellerLink: "#",
        description: "This beautiful sterling silver ring features a raw, uncut gemstone, making each ring a unique and one-of-a-kind piece. You can choose from a variety of gemstones, including amethyst, tourmaline, and garnet. The simple and elegant design of the ring allows the natural beauty of the gemstone to take center stage. This ring is a beautiful way to add a touch of natural beauty to your look.",
        images: [
            "https://placehold.co/600x600/b8b8b8/ffffff?text=Ring",
            "https://placehold.co/600x600/e0d9cf/6b584d?text=Ring+Close-up",
            "https://placehold.co/600x600/a2a2a2/ffffff?text=Ring+Detail"
        ],
        customizable: true,
        customOptions: ["Amethyst", "Tourmaline", "Garnet"]
    },
];

const mockBuyerOrders = [
    { orderId: "AM-2024-5231", date: "August 15, 2024", total: "$83.00", status: "Delivered", item: "Ceramic Coffee Mug" },
    { orderId: "AM-2024-4902", date: "July 28, 2024", total: "$75.00", status: "Delivered", item: "Embroidered Throw Pillow" },
    { orderId: "AM-2024-4115", date: "June 10, 2024", total: "$55.00", status: "Delivered", item: "Hand-Carved Wooden Bowl" },
];

const mockPayments = [
    { transactionId: "TR-2024-001", date: "August 20, 2024", amount: "$150.00", status: "Paid" },
    { transactionId: "TR-2024-002", date: "August 15, 2024", amount: "$250.00", status: "Paid" },
    { transactionId: "TR-2024-003", date: "August 10, 2024", amount: "$100.00", status: "Paid" },
    { transactionId: "TR-2024-004", date: "August 05, 2024", amount: "$300.00", status: "Paid" },
];

const mockSellerProducts = [
     { name: "Hand-Carved Wooden Bowl", image: "https://placehold.co/300x300/b8b8b8/ffffff?text=Product+1" },
     { name: "Rustic Serving Platter", image: "https://placehold.co/300x300/a2a2a2/ffffff?text=Product+New" },
     { name: "Walnut Cutting Board", image: "https://placehold.co/300x300/e0d9cf/6b584d?text=Product+Newer" }
];

const rawMaterials = [
    { id: 101, name: "Assorted Glass Beads", category: "Beads", price: "$15.00/pack", supplier: "BeadWorld", image: "https://placehold.co/600x400/c2c2c2/ffffff?text=Glass+Beads" },
    { id: 102, name: "Natural Wooden Beads", category: "Beads", price: "$12.00/pack", supplier: "WoodCraft", image: "https://placehold.co/600x400/c2c2c2/ffffff?text=Wooden+Beads" },
    { id: 201, name: "Organic Cotton Yarn", category: "Yarn", price: "$25.00/spool", supplier: "YarnBarn", image: "https://placehold.co/600x400/c2c2c2/ffffff?text=Cotton+Yarn" },
    { id: 202, name: "Merino Wool Yarn", category: "Yarn", price: "$35.00/spool", supplier: "YarnBarn", image: "https://placehold.co/600x400/c2c2c2/ffffff?text=Wool+Yarn" },
    { id: 301, name: "Stoneware Clay", category: "Clay", price: "$40.00/25lb", supplier: "ClayWorks", image: "https://placehold.co/600x400/c2c2c2/ffffff?text=Stoneware+Clay" },
    { id: 302, name: "Porcelain Clay", category: "Clay", price: "$50.00/25lb", supplier: "ClayWorks", image: "https://placehold.co/600x400/c2c2c2/ffffff?text=Porcelain+Clay" },
    { id: 401, name: "Walnut Wood Blocks", category: "Wood", price: "$60.00/set", supplier: "WoodCraft", image: "https://placehold.co/600x400/c2c2c2/ffffff?text=Walnut+Blocks" },
    { id: 402, name: "Cherry Wood Planks", category: "Wood", price: "$75.00/set", supplier: "WoodCraft", image: "https://placehold.co/600x400/c2c2c2/ffffff?text=Cherry+Planks" },
];