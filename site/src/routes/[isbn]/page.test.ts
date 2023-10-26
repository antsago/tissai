import '@testing-library/jest-dom/vitest'
import { describe, it, expect } from 'vitest'
import {render, screen} from '@testing-library/svelte'
import page from './+page.svelte'

const ISBN = '666'
const BOOK = { title: 'foo', author: 'bar', description: 'foobar', primary_isbn13: ISBN }
const RELATIONSHIPS = ['1', '2']

describe('render detail page', () => {
	it('shows book details', async () => {
		render(page, { data: { book: BOOK, recommended: RELATIONSHIPS } })

		const heading = screen.getByRole('heading')
		const description = screen.getByRole('main')
		const isbn = screen.getByRole('note')

		expect(heading).toHaveTextContent(`${BOOK.title} by ${BOOK.author}`);
		expect(description).toHaveTextContent(BOOK.description);
		expect(isbn).toHaveTextContent(BOOK.primary_isbn13);
	});
});
