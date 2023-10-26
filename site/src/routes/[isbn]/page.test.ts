import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi } from 'vitest'
import {render, screen} from '@testing-library/svelte'
import books from '../../../../data/books.json'
import relationships from '../../../../data/relationships.json'
import { load } from './+page.server'
import page from './+page.svelte'

vi.mock('../../../../data/books.json', () => ({ default: { 666: { title: 'foo', primary_isbn13: 666, amazon_product_url: 'https://www.example.com/dp/1649374046' }}}))
vi.mock('../../../../data/relationships.json', () => ({ default: { 666: [{ isbn: '1', score: '0.2' }, { isbn: '2', score: '0.3' }] } }))

describe('render detail page', () => {
	it('shows book details', async () => {
		const ISBN = '666'
		const BOOK = books[ISBN]
		const RELATIONSHIPS = relationships[ISBN]

		render(page, { data: await load({ params: { isbn: ISBN }} as any) })

		const heading = screen.getByRole('heading')
		const description = screen.getByRole('main')
		const isbn = screen.getByRole('note')
		const recommended = screen.getAllByRole('listitem')
		const buyLink = screen.getByRole('link', { name: 'Buy now!' })

		expect(heading).toHaveTextContent(`${BOOK.title} by ${BOOK.author}`);
		expect(description).toHaveTextContent(BOOK.description);
		expect(isbn).toHaveTextContent(BOOK.primary_isbn13);
		expect(buyLink).toHaveAttribute('href', BOOK.amazon_product_url);
		expect(recommended[0]).toHaveTextContent(RELATIONSHIPS[1].isbn);
		expect(recommended[1]).toHaveTextContent(RELATIONSHIPS[0].isbn);
	});
});
