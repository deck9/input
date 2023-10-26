<p>You got a new form submission for <a
       href="{{ route('forms.submissions', $form) }}"><strong>{{ $form->name }}</strong></a>.</p>

<table border="1">
    <thead>
        <tr>
            <th>ID</th>
            <th>Question</th>
            <th>Response</th>
        </tr>
    </thead>
    <tbody>
        @foreach($session['responses'] as $uid => $value)
        <tr>
            <td>{{ $uid }}</td>
            <td>{{ $value['message'] }}</td>
            <td>{{ $value['answer'] }}</td>
        </tr>
        @endforeach
    </tbody>
</table>