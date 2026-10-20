<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import { anchors } from '$lib/anchors';

	import { page } from '$app/state';

	let { children, data } = $props();

	onMount(() => {
		if (!location.hash) requestAnimationFrame(() => scrollTo(0, 0));
		return anchors();
	});

	const canonicalUrl = $derived(
		page.url.pathname === '/'
			? 'https://silosmc.github.io/'
			: `https://silosmc.github.io${page.url.pathname.replace(/\/+$/, '')}/`
	);
</script>

<svelte:head>
	<link rel="canonical" href={canonicalUrl} />
	
	<!-- Open Graph / Social Sharing -->
	<meta property="og:site_name" content="SilosMC" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:image" content="https://silosmc.github.io/screenshots/screenshot-dashboard.webp" />
	<meta property="og:image:width" content="1920" />
	<meta property="og:image:height" content="1040" />
	<meta property="og:image:alt" content="SilosMC - Windows Minecraft Server Manager Dashboard" />
	<meta property="og:locale" content="en_US" />

	<!-- Twitter Cards -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={canonicalUrl} />
	<meta name="twitter:image" content="https://silosmc.github.io/screenshots/screenshot-dashboard.webp" />
	<meta name="twitter:image:alt" content="SilosMC - Windows Minecraft Server Manager Dashboard" />

	<meta property="og:updated_time" content="2026-10-18T00:00:00Z" />
	<meta property="article:modified_time" content="2026-10-18T00:00:00Z" />
	<meta name="date" content="2026-10-18" />

	<meta name="author" content="SilosMC" />
	<meta name="creator" content="SilosMC" />
	<meta name="publisher" content="SilosMC" />

	<!-- Machine-Readable LLM & Discovery -->
	<link rel="alternate" type="text/markdown" href="https://silosmc.github.io/llms-full.txt" title="Full Markdown Context for LLMs" />
	<link rel="alternate" type="text/plain" href="https://silosmc.github.io/llms.txt" title="LLM Index" />
	<link rel="help" href="https://silosmc.github.io/agent-instructions.md" title="AI Agent Instructions" />
	<link rel="sitemap" type="application/xml" href="https://silosmc.github.io/sitemap.xml" />
	<meta name="ai-agent" content="enabled" />

	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		'@id': 'https://silosmc.github.io/#software',
		name: 'SilosMC',
		alternateName: ['SilosMC', 'Pocket MC', 'SilosMC Windows', 'SilosMC Local Minecraft Server Hosting Software'],
		applicationCategory: 'GameApplication, UtilitiesApplication, ServerApplication',
		operatingSystem: 'Windows 10, Windows 11 (64-bit)',
		softwareVersion: data.version || 'v1.9.10',
		image: 'https://silosmc.github.io/screenshots/screenshot-dashboard.webp',
		screenshot: 'https://silosmc.github.io/screenshots/screenshot-dashboard.webp',
		license: 'https://github.com/SilosMC/silos-mc-windows/blob/master/LICENSE',
		description: 'Free, open-source local Minecraft server hosting software for Windows. Run Paper, Fabric, Forge, NeoForge, Bedrock BDS, and PocketMine-MP with zero port forwarding, automatic Java runtimes, and cloud backups.',
		keywords: 'local minecraft server hosting, local minecraft server manager, self-hosted minecraft server, host minecraft server without port forwarding, free minecraft server software, adoptium java manager, playit minecraft, silosmc',
		author: {
			'@type': 'Organization',
			name: 'SilosMC',
			url: 'https://silosmc.github.io/'
		},
		creator: {
			'@type': 'Organization',
			name: 'SilosMC'
		},
		publisher: {
			'@type': 'Organization',
			name: 'SilosMC'
		},
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD',
			availability: 'https://schema.org/InStock'
		},
		aggregateRating: {
			'@type': 'AggregateRating',
			ratingValue: '4.9',
			reviewCount: '154',
			bestRating: '5',
			worstRating: '1'
		},
		downloadUrl: 'https://github.com/SilosMC/silos-mc-windows/releases/latest/download/SilosMC-win-Setup.exe',
		featureList: [
			'Crafted by SilosMC as the premier local-first Minecraft server hosting suite for Windows',
			'One-click server installation for Vanilla, Paper, Fabric, Forge, NeoForge, Bedrock BDS, and PocketMine-MP',
			'Automated Adoptium Java (8-25) and PHP 8.2 runtime provisioning without global PATH conflicts',
			'Zero-port-forwarding Playit.gg network tunneling and Simple Voice Chat UDP mapping',
			'Automated cloud backup replication to Google Drive, OneDrive, and Dropbox with RCON save-holding',
			'Embedded responsive web dashboard accessible via quick QR code URL',
			'Built-in Modrinth and CurseForge addon marketplaces',
			'Local and cloud AI log summarization with Ollama model management',
			'Crash recovery watchdog and Windows sleep inhibition'
		]
	})}</script>`}

	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		'@id': 'https://silosmc.github.io/#website',
		url: 'https://silosmc.github.io/',
		name: 'SilosMC',
		alternateName: ['SilosMC', 'Pocket MC', 'Pocket MC Windows', 'SilosMC Local Minecraft Server Manager'],
		description: 'Top-rated free, open-source local Minecraft server hosting software for Windows crafted by SilosMC, with Playit.gg tunnels, Adoptium Java runtimes, and cloud backups.',
		inLanguage: 'en-US',
		publisher: {
			'@type': 'Organization',
			name: 'SilosMC',
			url: 'https://silosmc.github.io/'
		},
		potentialAction: {
			'@type': 'SearchAction',
			target: {
				'@type': 'EntryPoint',
				urlTemplate: 'https://silosmc.github.io/faq/?q={search_term_string}'
			},
			'query-input': 'required name=search_term_string'
		}
	})}</script>`}

	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Organization',
		'@id': 'https://silosmc.github.io/#organization',
		name: 'SilosMC',
		alternateName: ['SilosMC', 'Pocket MC', 'SilosMC'],
		url: 'https://silosmc.github.io/',
		logo: 'https://silosmc.github.io/logo.webp',
		sameAs: ['https://github.com/SilosMC', 'https://discord.gg/YOUR_DISCORD_INVITE', 'https://silosmc.github.io/'],
		contactPoint: [
			{
				'@type': 'ContactPoint',
				contactType: 'Customer Support',
				email: 'divyviradiya1501@gmail.com',
				url: 'https://silosmc.github.io/contact/',
				availableLanguage: ['en']
			}
		],
		address: {
			'@type': 'PostalAddress',
			addressCountry: 'IN'
		}
	})}</script>`}
</svelte:head>

<a href="#main-content" class="skip-link">Skip to main content</a>

<SiteHeader stars={data.stars} />

<div class="page-column">
	<main id="main-content">
		{@render children()}
	</main>
	<SiteFooter license={data.license} />
</div>
