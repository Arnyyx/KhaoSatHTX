export async function GET() {
    try {
        const response = await fetch("http://localhost:5000/provinces")
        const data = await response.json()

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        })
    } catch (error) {
        return new Response("Error fetching data", {
            status: 500,
        })
    }
}
