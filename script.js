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

// ---------- start: фото всплывает поверх текста по наведению ----------
const startStage = document.querySelector('.start-stage')
const dollsTrigger = document.querySelector('.dolls-trigger')

if (startStage && dollsTrigger) {
	const startPop = startStage.querySelector('.start-pop')
	let closeTimer = null

	const openPop = () => {
		clearTimeout(closeTimer)
		startStage.classList.add('photo-open')
	}

	const closePop = () => {
		closeTimer = setTimeout(() => startStage.classList.remove('photo-open'), 120)
	}

	;[dollsTrigger, startPop].forEach(el => {
		el.addEventListener('mouseenter', openPop)
		el.addEventListener('mouseleave', closePop)
	})

	dollsTrigger.addEventListener('focus', openPop)
	dollsTrigger.addEventListener('blur', closePop)
	dollsTrigger.addEventListener('click', openPop)
	document.addEventListener('keydown', e => {
		if (e.key === 'Escape') startStage.classList.remove('photo-open')
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
	abbrs.forEach((a, i) => {
		const s = document.createElement('span')
		s.textContent = a
		const ang = (i / abbrs.length) * Math.PI * 2 + Math.random() * 0.5
		const w = boom.clientWidth || 900
		const h = boom.clientHeight || 420
		const rx = w * 0.34 + Math.random() * w * 0.16
		const ry = h * 0.32 + Math.random() * h * 0.18
		s.style.setProperty('--x', Math.cos(ang) * rx + 'px')
		s.style.setProperty('--y', Math.sin(ang) * ry + 'px')
		s.style.setProperty('--r', Math.random() * 44 - 22 + 'deg')
		s.style.setProperty('--o', (0.12 + Math.random() * 0.5).toFixed(2))
		s.style.fontSize = 13 + Math.random() * 26 + 'px'
		const colors = ['var(--red)', 'var(--wine)', 'var(--grey)']
		s.style.color = colors[Math.floor(Math.random() * colors.length)]
		s.style.transitionDelay = Math.random() * 0.35 + 's'
		boom.appendChild(s)
	})

	new IntersectionObserver(
		([e], obs) => {
			if (e.isIntersecting) {
				boom.classList.add('go')
				obs.disconnect()
			}
		},
		{ threshold: 0.5 },
	).observe(boom.parentElement)
}

// ---------- tasks hover/click reveal ----------
const taskItems = document.querySelectorAll('[data-task]')

taskItems.forEach(el => {
	const openTask = () => {
		const isActive = el.classList.contains('active')
		const ksrpPhoto = el.querySelector('.task-photo-inline')
		
		// Закрываем все блоки и скрываем все фото
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
		
		// Открываем текущий блок если он не был активен
		if (!isActive) {
			el.classList.add('active')
			// Показываем фото КСРП если это нужный блок
			if (ksrpPhoto) {
				ksrpPhoto.style.display = 'block'
				// Небольшая задержка для плавности
				setTimeout(() => {
					ksrpPhoto.classList.add('visible')
				}, 100)
			}
		}
	}
	
	// При наведении
	el.addEventListener('mouseenter', openTask)
	
	// При клике
	el.querySelector('.task-short')?.addEventListener('click', openTask)
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
		path.addEventListener('click', () => selectSkill(i))
		wheel.appendChild(path)
		wheel.appendChild(labelGroup)
	})

	function selectSkill(i) {
		wheel.querySelectorAll('.segment').forEach((s, j) => {
			s.classList.toggle('active', j === i)
		})
		wheelLabel.textContent = skills[i].label
		wheelDetail.innerHTML = `<p class="wheel-detail-text">${skills[i].text}</p>`
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
		if (autoRotate && !isDragging) setRotation(rotation + 0.12)
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
