import pc from 'picocolors'

const isJsonMode = () => process.argv.includes('--json')

export const handleError = (error: unknown, message?: string) => {
	const errorMessage = error instanceof Error ? error.message : String(error)
	
	if (isJsonMode()) {
		console.log(JSON.stringify({
			success: false,
			error: message || errorMessage
		}))
	} else {
		console.error(pc.red(message || errorMessage))
	}
	process.exit(1)
}

export const outputJson = (data: unknown) => {
	console.log(JSON.stringify(data, null, 2))
}

export const isJson = () => isJsonMode()
