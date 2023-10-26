import { describe, it, expect, vi } from 'vitest'
import books from '../../../../data/books.json'
import relationships from '../../../../data/relationships.json'
import { load } from './+page.server'

vi.mock('../../../../data/books.json', () => ({ default: { 666: { title: 'foo', primary_isbn13: 666 }}}))
vi.mock('../../../../data/relationships.json', () => ({ default: { 666: [{ isbn: '1', score: '0.2' }, { isbn: '2', score: '0.3' }] } }))

describe('load detail page', () => {
	it('returns books details', async () => {
		const ISBN = '666'
		const BOOK = books[ISBN]
		const RELATIONSHIPS = relationships[ISBN]

		const result = await load({ params: { isbn: ISBN }} as any)

		expect(result).toStrictEqual({
			book: BOOK,
			recommended: [RELATIONSHIPS[1].isbn, RELATIONSHIPS[0].isbn],
		});
	});
});
