import * as vscode from "vscode";

/**
 * Pre-formed C# blocks inserted by the {@link PatternCodeActionProvider}.
 *
 * Kept in a separate module so they can be unit-tested without touching the
 * VS Code API surface.
 */
export interface PatternTemplate {
    /** Identifier used in the CodeAction title and tests. */
    id: string;
    /** Human-friendly title shown in the lightbulb menu. */
    title: string;
    /** Snippet body inserted at the cursor. */
    body: string;
}

const RESULT_PATTERN = `public sealed class Result<T>
{
    public bool IsSuccess { get; }
    public T? Value { get; }
    public string? Error { get; }

    private Result(bool isSuccess, T? value, string? error)
    {
        IsSuccess = isSuccess;
        Value = value;
        Error = error;
    }

    public static Result<T> Success(T value) => new(true, value, null);
    public static Result<T> Failure(string error) => new(false, default, error);
}
`;

const OPTION_PATTERN = `public readonly struct Option<T>
{
    private readonly T? _value;
    public bool HasValue { get; }

    private Option(T? value, bool hasValue)
    {
        _value = value;
        HasValue = hasValue;
    }

    public static Option<T> Some(T value) => new(value, true);
    public static Option<T> None() => new(default, false);

    public T ValueOr(T fallback) => HasValue ? _value! : fallback;
}
`;

const REPOSITORY_PATTERN = `public interface IRepository<TEntity, TKey>
    where TEntity : class
{
    Task<TEntity?> GetByIdAsync(TKey id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TEntity>> ListAsync(CancellationToken cancellationToken = default);
    Task AddAsync(TEntity entity, CancellationToken cancellationToken = default);
    void Update(TEntity entity);
    void Remove(TEntity entity);
}
`;

const CQRS_PATTERN = `public sealed record GetItemByIdQuery(Guid Id) : IRequest<ItemDto?>;

public sealed class GetItemByIdQueryHandler(IRepository<Item, Guid> repository)
    : IRequestHandler<GetItemByIdQuery, ItemDto?>
{
    public async Task<ItemDto?> Handle(GetItemByIdQuery request, CancellationToken cancellationToken)
    {
        var item = await repository.GetByIdAsync(request.Id, cancellationToken);
        return item is null ? null : new ItemDto(item.Id, item.Name);
    }
}

public sealed record ItemDto(Guid Id, string Name);
`;

const SPECIFICATION_PATTERN = `public abstract class Specification<T>
{
    public abstract Expression<Func<T, bool>> ToExpression();

    public bool IsSatisfiedBy(T candidate) => ToExpression().Compile().Invoke(candidate);

    public Specification<T> And(Specification<T> other) => new AndSpecification<T>(this, other);
    public Specification<T> Or(Specification<T> other) => new OrSpecification<T>(this, other);
}

internal sealed class AndSpecification<T>(Specification<T> left, Specification<T> right) : Specification<T>
{
    public override Expression<Func<T, bool>> ToExpression()
    {
        var l = left.ToExpression();
        var r = right.ToExpression();
        var parameter = Expression.Parameter(typeof(T));
        var body = Expression.AndAlso(
            Expression.Invoke(l, parameter),
            Expression.Invoke(r, parameter));
        return Expression.Lambda<Func<T, bool>>(body, parameter);
    }
}

internal sealed class OrSpecification<T>(Specification<T> left, Specification<T> right) : Specification<T>
{
    public override Expression<Func<T, bool>> ToExpression()
    {
        var l = left.ToExpression();
        var r = right.ToExpression();
        var parameter = Expression.Parameter(typeof(T));
        var body = Expression.OrElse(
            Expression.Invoke(l, parameter),
            Expression.Invoke(r, parameter));
        return Expression.Lambda<Func<T, bool>>(body, parameter);
    }
}
`;

const BUILDER_PATTERN = `public sealed class TBuilder
{
    private string _name = string.Empty;
    private int _quantity;

    public TBuilder WithName(string name) { _name = name; return this; }
    public TBuilder WithQuantity(int quantity) { _quantity = quantity; return this; }

    public TResult Build() => new(_name, _quantity);
}

public sealed record TResult(string Name, int Quantity);
`;

const UNIT_OF_WORK_PATTERN = `public interface IUnitOfWork : IAsyncDisposable
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}
`;

/**
 * All pattern templates exposed by the {@link PatternCodeActionProvider}.
 */
export const PATTERN_TEMPLATES: PatternTemplate[] = [
    { id: "result", title: "Insert: Result<T> pattern", body: RESULT_PATTERN },
    { id: "option", title: "Insert: Option<T> / Maybe pattern", body: OPTION_PATTERN },
    { id: "repository", title: "Insert: Generic Repository interface", body: REPOSITORY_PATTERN },
    { id: "cqrs", title: "Insert: CQRS query + handler", body: CQRS_PATTERN },
    { id: "specification", title: "Insert: Specification pattern", body: SPECIFICATION_PATTERN },
    { id: "builder", title: "Insert: Fluent Builder skeleton", body: BUILDER_PATTERN },
    { id: "unitofwork", title: "Insert: Unit of Work interface", body: UNIT_OF_WORK_PATTERN },
];
