import json

PAGE_ID = "test-id"
pageForTest = lambda schemas: {
    "id": PAGE_ID,
    "body": f"""
        <html>
          <head>
            {"".join([f'<script type="application/ld+json">{json.dumps(schema)}</script>' for schema in schemas])}
            <script src=\"_ascript\"></script>
          </head>
        </html>
    """,
}
