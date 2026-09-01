// ---------- 3D nav animation ----------
const navLinks = document.querySelectorAll('.nav-link')

navLinks.forEach(link => {
	const text = link.textContent
	link.textContent = ''
	
	text.split('').forEach((char, index) => {
		const span = document.createElement('span')
		span.textContent = char
		span.className = 'nav-char'
		span.style.setProperty('--char-index', index)
		link.appendChild(span)
	})
})

// ---------- custom cursor ----------
const cursor = document.getElementById('cursor')
const cursorGlow = document.getElementById('cursorGlow')
let mx = 0,
	my = 0,
	cx = 0,
	cy = 0

if (cursor && window.matchMedia('(pointer: fine)').matches) {
	document.addEventListener('mousemove', e => {
		mx = e.clientX
		my = e.clientY
	})

	const tick = () => {
		cx += (mx - cx) * 0.18
		cy += (my - cy) * 0.18
		cursor.style.left = cx + 'px'
		cursor.style.top = cy + 'px'
		cursorGlow.style.left = cx + 'px'
		cursorGlow.style.top = cy + 'px'
		requestAnimationFrame(tick)
	}
	tick()

	document.querySelectorAll('a, button, [data-task], .segment, .nav-char').forEach(el => {
		el.addEventListener('mouseenter', () => cursor.classList.add('hover-link'))
		el.addEventListener('mouseleave', () =>
			cursor.classList.remove('hover-link'),
		)
	})

	document
		.querySelectorAll('h1, h2, h3, .h2, blockquote, .quote-large, .scroll-fill')
		.forEach(el => {
			el.addEventListener('mouseenter', () => cursorGlow.classList.add('on'))
			el.addEventListener('mouseleave', () => cursorGlow.classList.remove('on'))
		})
}

// ---------- reveal on scroll ----------
const io = new IntersectionObserver(
	entries => {
		entries.forEach(e => {
			if (e.isIntersecting) {
				e.target.classList.add('on')
				io.unobserve(e.target)
			}
		})
	},
	{ threshold: 0.12 },
)

document.querySelectorAll('.reveal').forEach(el => io.observe(el))

const motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches

// ---------- reading progress ----------
const progressBar = document.getElementById('progressBar')

if (progressBar) {
	const updateProgress = () => {
		const max = document.documentElement.scrollHeight - window.innerHeight
		const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
		progressBar.style.transform = `scaleX(${p})`
	}
	window.addEventListener('scroll', updateProgress, { passive: true })
	window.addEventListener('resize', updateProgress)
	updateProgress()
}

// ---------- word mask reveal ----------
if (motionOk) {
	const splitWords = el => {
		const frag = document.createDocumentFragment()
		let i = 0

		const pushWord = node => {
			const word = document.createElement('span')
			word.className = 'word'
			const inner = document.createElement('span')
			inner.style.setProperty('--i', i++)
			inner.appendChild(node)
			word.appendChild(inner)
			frag.appendChild(word)
		}

		Array.from(el.childNodes).forEach(node => {
			if (node.nodeType === Node.TEXT_NODE) {
				const parts = node.textContent.split(/(\s+)/)
				parts.forEach(part => {
					if (!part) return
					if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(' '))
					else pushWord(document.createTextNode(part))
				})
			} else if (node.nodeName === 'BR') {
				frag.appendChild(node)
			} else {
				pushWord(node)
			}
		})

		el.textContent = ''
		el.appendChild(frag)
		el.classList.add('words')
	}

	document.querySelectorAll('.hero h1, h2.h2').forEach(splitWords)
}

// ---------- photo parallax ----------
const parallaxImgs = Array.from(
	document.querySelectorAll(
		'#turn figure img, .task-photo-inline img',
	),
)

if (motionOk && parallaxImgs.length) {
	parallaxImgs.forEach(img => {
		img.classList.add('parallax-img')
		if (img.parentElement) img.parentElement.classList.add('parallax-frame')
	})

	let ticking = false
	const updateParallax = () => {
		const vh = window.innerHeight
		parallaxImgs.forEach(img => {
			const rect = img.getBoundingClientRect()
			if (rect.bottom < -200 || rect.top > vh + 200) return
			const centerDelta = rect.top + rect.height / 2 - vh / 2
			const shift = Math.max(-28, Math.min(28, (-centerDelta / vh) * 40))
			img.style.setProperty('--py', `${shift.toFixed(1)}px`)
		})
		ticking = false
	}
	const onScrollParallax = () => {
		if (ticking) return
		ticking = true
		requestAnimationFrame(updateParallax)
	}
	window.addEventListener('scroll', onScrollParallax, { passive: true })
	window.addEventListener('resize', onScrollParallax)
	updateParallax()
}

// ---------- stats count up ----------
const statsBlock = document.querySelector('.stats')

if (statsBlock) {
	const runCount = () => {
		statsBlock.querySelectorAll('.stat-num').forEach(el => {
			const target = parseFloat(el.dataset.count)
			const decimals = parseInt(el.dataset.decimals || '0', 10)
			if (!motionOk) {
				el.textContent = target.toFixed(decimals).replace('.', ',')
				return
			}
			const duration = 1200
			const start = performance.now()
			const step = now => {
				const t = Math.min(1, (now - start) / duration)
				const eased = 1 - Math.pow(1 - t, 3)
				el.textContent = (target * eased).toFixed(decimals).replace('.', ',')
				if (t < 1) requestAnimationFrame(step)
			}
			requestAnimationFrame(step)
		})
	}

	new IntersectionObserver(
		(entries, obs) => {
			entries.forEach(e => {
				if (e.isIntersecting) {
					runCount()
					obs.disconnect()
				}
			})
		},
		{ threshold: 0.4 },
	).observe(statsBlock)
}

// ---------- start: фото всплывает поверх текста по наведению ----------
const startStage = document.querySelector('.start-stage')
const dollsTrigger = document.querySelector('.dolls-trigger')

if (startStage && dollsTrigger) {
	const HOLD_MS = 1000
	let holdTimer = null
	let armed = false
	let anchor = null
	let pointer = { x: 0, y: 0 }

	const closePop = () => {
		clearTimeout(holdTimer)
		armed = false
		startStage.classList.remove('photo-open')
	}

	const openPop = () => {
		clearTimeout(holdTimer)
		armed = false
		startStage.classList.add('photo-open')
		holdTimer = setTimeout(() => {
			armed = true
			anchor = pointer
		}, HOLD_MS)
	}

	dollsTrigger.addEventListener('mouseenter', openPop)
	dollsTrigger.addEventListener('focus', openPop)
	dollsTrigger.addEventListener('blur', closePop)

	document.addEventListener('mousemove', e => {
		pointer = { x: e.clientX, y: e.clientY }
		if (!armed) return
		if (Math.hypot(e.clientX - anchor.x, e.clientY - anchor.y) > 6) closePop()
	})

	document.addEventListener('keydown', e => {
		if (e.key === 'Escape') closePop()
	})
}

// ---------- liked strip: бесконечная бегущая лента ----------
const stripTrack = document.querySelector('.strip-track')
if (stripTrack) {
	const SPEED = 40 // px/s
	const GAP = 16

	Array.from(stripTrack.children).forEach(el => {
		const copy = el.cloneNode(true)
		copy.setAttribute('aria-hidden', 'true')
		stripTrack.appendChild(copy)
	})

	const setDuration = () => {
		const half = (stripTrack.scrollWidth - GAP) / 2
		if (half > 0)
			stripTrack.style.setProperty('--strip-duration', `${half / SPEED}s`)
	}

	setDuration()
	window.addEventListener('load', setDuration)
	window.addEventListener('resize', setDuration)
	stripTrack.querySelectorAll('img').forEach(img => {
		if (!img.complete) img.addEventListener('load', setDuration, { once: true })
	})
}

// city lines animation
const cityLines = document.querySelector('.city-lines')
if (cityLines) {
	new IntersectionObserver(
		([e]) => {
			if (e.isIntersecting) cityLines.classList.add('on')
		},
		{ threshold: 0.3 },
	).observe(cityLines)
}

// ---------- abbr boom ----------
const boom = document.getElementById('boom')
if (boom) {
	const abbrs = [
		'МАП',
		'КСРП',
		'КМТ',
		'ТРР',
		'МОП',
		'РП',
		'БУД',
		'БКН',
		'БОС',
		'ПМТ',
		'ГПЗУ',
		'КХ',
	]
	const spans = abbrs.map((a, i) => {
		const s = document.createElement('span')
		s.textContent = a
		s.dataset.ang = (i / abbrs.length) * Math.PI * 2 + Math.random() * 0.5
		s.dataset.spread = (0.75 + Math.random() * 0.35).toFixed(2)
		s.style.setProperty('--r', Math.random() * 44 - 22 + 'deg')
		s.style.setProperty('--o', (0.12 + Math.random() * 0.38).toFixed(2))
		s.style.fontSize = 13 + Math.random() * 22 + 'px'
		const colors = ['var(--red)', 'var(--wine)', 'var(--grey)']
		s.style.color = colors[Math.floor(Math.random() * colors.length)]
		s.style.transitionDelay = Math.random() * 0.35 + 's'
		boom.appendChild(s)
		return s
	})

	const textEls = Array.from(
		boom.parentElement.querySelectorAll('.kicker, .h2, .lead'),
	)

	const place = () => {
		const box = boom.getBoundingClientRect()
		const cx = box.width / 2
		const cy = box.height / 2
		let safeRight = 0
		let safeTop = cy
		let safeBottom = cy
		textEls.forEach(el => {
			const r = el.getBoundingClientRect()
			safeRight = Math.max(safeRight, r.right - box.left)
			safeTop = Math.min(safeTop, r.top - box.top)
			safeBottom = Math.max(safeBottom, r.bottom - box.top)
		})

		spans.forEach(s => {
			const ang = parseFloat(s.dataset.ang)
			const spread = parseFloat(s.dataset.spread)
			let x = Math.cos(ang) * cx * spread
			let y = Math.sin(ang) * (box.height * 0.42) * spread
			const half = s.offsetWidth / 2 + 14
			const limit = cx - half
			const minRight = safeRight - cx + half + 20

			if (cy + y > safeTop - 20 && cy + y < safeBottom + 20) {
				if (minRight <= limit) x = Math.max(x, minRight)
				else y = y < 0 ? safeTop - cy - 34 : safeBottom - cy + 34
			}

			s.style.setProperty('--x', Math.max(-limit, Math.min(limit, x)) + 'px')
			s.style.setProperty('--y', Math.max(-cy + 14, Math.min(cy - 14, y)) + 'px')
		})
	}

	place()
	window.addEventListener('resize', place)

	new IntersectionObserver(
		([e], obs) => {
			if (e.isIntersecting) {
				place()
				boom.classList.add('go')
				obs.disconnect()
			}
		},
		{ threshold: 0.5 },
	).observe(boom.parentElement)
}

// ---------- tasks hover/click reveal ----------
const taskItems = document.querySelectorAll('[data-task]')

let taskHoverTimer = null

taskItems.forEach(el => {
	const openTask = () => {
		const isActive = el.classList.contains('active')
		const ksrpPhoto = el.querySelector('.task-photo-inline')

		taskItems.forEach(t => {
			t.classList.remove('active')
			const photo = t.querySelector('.task-photo-inline')
			if (photo) {
				photo.classList.remove('visible')
				setTimeout(() => {
					if (!photo.classList.contains('visible')) {
						photo.style.display = 'none'
					}
				}, 500)
			}
		})

		if (!isActive) {
			const full = el.querySelector('.task-full')
			if (full) full.style.setProperty('--full-h', `${full.scrollHeight}px`)
			el.classList.add('active')
			if (ksrpPhoto) {
				ksrpPhoto.style.display = 'block'
				setTimeout(() => {
					ksrpPhoto.classList.add('visible')
				}, 100)
			}
		}
	}

	el.addEventListener('mouseenter', () => {
		if (el.classList.contains('active')) return
		clearTimeout(taskHoverTimer)
		taskHoverTimer = setTimeout(openTask, 160)
	})

	el.addEventListener('mouseleave', () => clearTimeout(taskHoverTimer))

	el.querySelector('.task-short')?.addEventListener('click', () => {
		clearTimeout(taskHoverTimer)
		openTask()
	})
})

// ---------- skills wheel ----------
const COLORS = ['#FF001F', '#8B2E42']

const skills = [
	{ label: 'Анализ', text: 'Анализировать конкурентное окружение' },
	{ label: 'Среда', text: 'Работать с проектами жилой и городской среды' },
	{ label: 'Идеи', text: 'Формулировать и структурировать идеи' },
	{ label: 'Сценарии', text: 'Готовить сценарии и презентационные материалы' },
	{ label: 'Протоколы', text: 'Фиксировать содержание рабочих встреч' },
	{
		label: 'Решения',
		text: 'Выделять решения и поручения из большого объёма информации',
	},
	{
		label: 'Связь',
		text: 'Понимать взаимосвязь между продуктом, территорией и коммуникацией',
	},
	{
		label: 'Стадии',
		text: 'Работать с проектами на разных стадиях готовности',
	},
	{ label: 'Команда', text: 'Взаимодействовать с несколькими подразделениями' },
	{ label: 'Адаптация', text: 'Быстрее адаптироваться к новой среде' },
	{ label: 'Вопросы', text: 'Задавать вопросы и не бояться незнания' },
	{ label: 'Критика', text: 'Принимать критику' },
	{
		label: 'Обзор',
		text: 'Видеть связь между разными профессиональными направлениями',
	},
	{
		label: 'Свобода',
		text: 'Работать самостоятельно, не привязанной к одному рабочему месту',
	},
]

const wheel = document.getElementById('skillsWheel')
const wheelSpin = document.getElementById('wheelSpin')
const wheelLabel = document.getElementById('wheelLabel')
const wheelDetail = document.getElementById('wheelDetail')
const wheelContainer = document.getElementById('wheelContainer')
const SVG_NS = 'http://www.w3.org/2000/svg'

if (wheel && wheelSpin && wheelContainer) {
	const cx = 200,
		cy = 200,
		r = 178,
		ir = 58
	const n = skills.length
	const step = (2 * Math.PI) / n
	let rotation = 0
	let isDragging = false
	let lastAngle = 0
	let targetRotation = null

	skills.forEach((skill, i) => {
		const start = i * step - Math.PI / 2
		const end = start + step
		const x1 = cx + r * Math.cos(start)
		const y1 = cy + r * Math.sin(start)
		const x2 = cx + r * Math.cos(end)
		const y2 = cy + r * Math.sin(end)
		const xi1 = cx + ir * Math.cos(start)
		const yi1 = cy + ir * Math.sin(start)
		const xi2 = cx + ir * Math.cos(end)
		const yi2 = cy + ir * Math.sin(end)
		const large = step > Math.PI ? 1 : 0

		const path = document.createElementNS(SVG_NS, 'path')
		path.setAttribute(
			'd',
			`M ${xi1} ${yi1} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${ir} ${ir} 0 ${large} 0 ${xi1} ${yi1} Z`,
		)
		path.setAttribute('fill', COLORS[i % 2])
		path.setAttribute('class', 'segment')
		path.dataset.idx = i

		const mid = start + step / 2
		const labelR = (r + ir) / 2 + 2
		const tx = cx + labelR * Math.cos(mid)
		const ty = cy + labelR * Math.sin(mid)
		let rotDeg = (mid * 180) / Math.PI
		if (rotDeg > 90 || rotDeg < -90) rotDeg += 180

		const labelGroup = document.createElementNS(SVG_NS, 'g')
		labelGroup.setAttribute(
			'transform',
			`translate(${tx}, ${ty}) rotate(${rotDeg})`,
		)

		const label = document.createElementNS(SVG_NS, 'text')
		label.setAttribute('class', 'segment-label')
		label.setAttribute('x', '0')
		label.setAttribute('y', '0')
		label.setAttribute('text-anchor', 'middle')
		label.setAttribute('dominant-baseline', 'middle')
		label.textContent = skill.label

		labelGroup.appendChild(label)
		path.addEventListener('click', () => {
			selectSkill(i)
			rotateToTop(i)
		})
		wheel.appendChild(path)
		wheel.appendChild(labelGroup)
	})

	function selectSkill(i) {
		wheel.querySelectorAll('.segment').forEach((s, j) => {
			s.classList.toggle('active', j === i)
		})
		wheelLabel.textContent = skills[i].label
		wheelDetail.querySelector('.wheel-detail-text').textContent = skills[i].text
	}

	function rotateToTop(i) {
		const stepDeg = 360 / n
		let target = -(i + 0.5) * stepDeg
		target += 360 * Math.round((rotation - target) / 360)
		targetRotation = target
	}

	function setRotation(deg) {
		rotation = deg
		wheelSpin.style.transform = `rotate(${rotation}deg)`
	}

	function getAngle(e) {
		const rect = wheelContainer.getBoundingClientRect()
		const x =
			(e.clientX ?? e.touches?.[0]?.clientX) - rect.left - rect.width / 2
		const y =
			(e.clientY ?? e.touches?.[0]?.clientY) - rect.top - rect.height / 2
		return Math.atan2(y, x)
	}

	wheelContainer.addEventListener('mousedown', e => {
		if (e.target.classList.contains('segment')) return
		isDragging = true
		lastAngle = getAngle(e)
	})

	window.addEventListener('mousemove', e => {
		if (!isDragging) return
		targetRotation = null
		const a = getAngle(e)
		setRotation(rotation + (a - lastAngle) * (180 / Math.PI))
		lastAngle = a
	})

	window.addEventListener('mouseup', () => {
		isDragging = false
	})

	wheelContainer.addEventListener(
		'touchstart',
		e => {
			isDragging = true
			lastAngle = getAngle(e)
		},
		{ passive: true },
	)

	window.addEventListener(
		'touchmove',
		e => {
			if (!isDragging) return
			const a = getAngle(e)
			setRotation(rotation + (a - lastAngle) * (180 / Math.PI))
			lastAngle = a
		},
		{ passive: true },
	)

	window.addEventListener('touchend', () => {
		isDragging = false
	})

	let autoRotate = true
	wheelContainer.addEventListener('mouseenter', () => {
		autoRotate = false
	})
	wheelContainer.addEventListener('mouseleave', () => {
		autoRotate = true
	})

	const spin = () => {
		if (targetRotation !== null) {
			const diff = targetRotation - rotation
			if (Math.abs(diff) < 0.15) {
				setRotation(targetRotation)
				targetRotation = null
			} else {
				setRotation(rotation + diff * 0.12)
			}
		} else if (autoRotate && !isDragging) {
			setRotation(rotation + 0.12)
		}
		requestAnimationFrame(spin)
	}
	spin()

	selectSkill(0)
}

// ---------- scroll fill finale ----------
const scrollFill = document.getElementById('scrollFillText')
const scrollFillWrap = document.getElementById('scrollFillWrap')

if (scrollFill && scrollFillWrap) {
	const updateFill = () => {
		const rect = scrollFillWrap.getBoundingClientRect()
		const vh = window.innerHeight
		const scrollMax = document.documentElement.scrollHeight - vh

		const startY = vh * 0.82
		const endY = vh * 0.22
		let progress = (startY - rect.top) / (startY - endY)

		if (window.scrollY >= scrollMax - 8) progress = 1

		progress = Math.min(1, Math.max(0, progress))
		scrollFill.style.setProperty('--fill', `${progress * 100}%`)
	}

	window.addEventListener('scroll', updateFill, { passive: true })
	window.addEventListener('resize', updateFill)
	updateFill()
}
