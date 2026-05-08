import Template from '../models/template.model.js';
import path from 'path';

export const getPosterPreview = async (req, res) => {
  const { id } = req.params;

  try {
    const template = await Template.findById(id).populate('categoryId').populate('subcategoryId');
    if (!template) {
      return res.status(404).send('Template not found');
    }

    const catName = template.categoryId?.name || '';
    const subName = template.subcategoryId?.name || '';
    const isBusinessCard = catName.toLowerCase().includes('business card') || subName.toLowerCase().includes('business card');

    const title = template.name || (isBusinessCard ? 'Digital Business Card' : 'Professional Poster');
    const description = isBusinessCard 
      ? 'Create your own professional digital business card with Dealingindia Poster!' 
      : 'Create amazing professional posters and videos with Dealingindia Poster!';
    const image = template.image;
    
    // Redirect to the actual frontend app
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    let redirectUrl;
    
    if (isBusinessCard) {
      redirectUrl = `${frontendUrl}/business-card/editor/${id}`;
    } else {
      redirectUrl = `${frontendUrl}/?templateId=${id}`;
    }

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Primary Meta Tags -->
    <title>${title}</title>
    <meta name="title" content="${title}">
    <meta name="description" content="${description}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${redirectUrl}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${image}">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${redirectUrl}">
    <meta property="twitter:title" content="${title}">
    <meta property="twitter:description" content="${description}">
    <meta property="twitter:image" content="${image}">

    <script>
        // Redirect to the app
        window.location.href = "${redirectUrl}";
    </script>
</head>
<body>
    <p>Redirecting to Dealingindia Poster...</p>
</body>
</html>
    `;

    res.send(html);
  } catch (error) {
    console.error('Share preview error:', error);
    res.status(500).send('Internal Server Error');
  }
};
