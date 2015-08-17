/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("administrativo-acesso-usuarios", []) 

.controller("administrativo-acesso-usuariosCtrl", ['$scope',
                                            '$state',
                                            '$http',
                                            /*'$campos',*/
                                            '$webapi',
                                            '$apis',
                                            '$filter', 
                                            function($scope,$state,$http,/*$campos,*/
                                                     $webapi,$apis,$filter){ 
   
    var divPortletBodyLogsPos = 0; // posição da div que vai receber o loading progress
    $scope.paginaInformada = 1; // página digitada pelo privilégio
    $scope.logs = [];
    $scope.modalLog = { log : null };                                            
    $scope.camposBusca = [{
                            id: 201,
                            /*id: $campos.administracao.logacesso.webpagesusers + 
                                  $campos.administracao.webpagesusers.ds_login - 100,*/
                            ativo: true,  
                            nome: "Login"
                          },
                          {
                              id: 301,
                            /*id: $campos.administracao.logacesso.webpagescontrollers + 
                                $campos.administracao.webpagescontrollers.ds_controller - 100,*/
                            ativo: true,  
                            nome: "Módulo"
                          }];
    $scope.itens_pagina = [10, 20, 50, 100];
    $scope.filtro = {busca:'', campo_busca : $scope.camposBusca[0], 
                      itens_pagina : $scope.itens_pagina[0], pagina : 1,
                      total_registros : 0, faixa_registros : '0-0', total_paginas : 0, 
                      campo_ordenacao : {id: 103,//$campos.administracao.logacesso.dtAcesso, 
                                         order : 1}};    
    // flags
    $scope.exibeTela = false;                                            
 
                                                
    // Inicialização do controller
    $scope.administrativo_acessoUsuariosInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Logs';                          
        $scope.pagina.subtitulo = 'Acesso de Usuários';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });  
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Busca Logs
            $scope.buscaLogs();
        });
        // Acessou a tela
        $scope.$emit("acessouTela");
        // Busca Logs
        //$scope.buscaLogs();
    } 
                                                
    /** 
      * Substitui na string os '\n' e coloca a quebra de linha do html
      */
    $scope.adicionaQuebraLinhaHtml = function(text){
        console.log(text);
        console.log($scope.modalLog.log.msgErro);
        if(typeof text === 'string') return text.split("\n").join(String.fromCharCode(160));
        return text;
    }                                            
                                                
                                                
    // ORDENAÇÃO
    /**
      * Modifica a ordenação
      */
    var ordena = function(posCampo){
        if(posCampo >= 0 && posCampo < $scope.camposBusca.length){
            if($scope.filtro.campo_ordenacao.id !== $scope.camposBusca[posCampo].id){ 
                $scope.filtro.campo_ordenacao.id = $scope.camposBusca[posCampo].id;
                $scope.filtro.campo_ordenacao.order = 0; // começa descendente                                 
            }else
                // Inverte a ordenação: ASCENDENTE => DESCENDENTE e vice-versa                                
                $scope.filtro.campo_ordenacao.order = $scope.filtro.campo_ordenacao.order === 0 ? 1 : 0;                                
            $scope.buscaLogs(); 
        }
    };
    /**
      * Ordena por nome
      */
    $scope.ordena = function(){
        ordena(0);    
    }
    /**
      * Retorna true se a ordenação está sendo feito por nome de forma crescente
      */
    $scope.estaOrdenadoCrescente = function(){
        return $scope.filtro.campo_ordenacao.id === $scope.camposBusca[0].id && 
               $scope.filtro.campo_ordenacao.order === 0;    
    };
    /**
      * Retorna true se a ordenação está sendo feito por nome de forma decrescente
      */
    $scope.estaOrdenadoDecrescente = function(){
        return $scope.filtro.campo_ordenacao.id === $scope.camposBusca[0].id && 
               $scope.filtro.campo_ordenacao.order === 1;    
    };                          
                                            
                                            
                                                
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.filtro.total_paginas){ 
           $scope.filtro.pagina = pagina;
           $scope.buscaLogs(); 
       }
       $scope.atualizaPaginaDigitada();    
    };
    /**
      * Vai para a página anterior
      */
    $scope.retrocedePagina = function(){
        setPagina($scope.filtro.pagina - 1); 
    };
    /**
      * Vai para a página seguinte
      */                                            
    $scope.avancaPagina = function(){
        setPagina($scope.filtro.pagina + 1); 
    };
    /**
      * Foi informada pelo usuário uma página para ser exibida
      */                                            
    $scope.alteraPagina = function(){
        if($scope.paginaInformada) setPagina(parseInt($scope.paginaInformada));
        else $scope.atualizaPaginaDigitada();  
    };
    /**
      * Sincroniza a página digitada com a que efetivamente está sendo exibida
      */                                            
    $scope.atualizaPaginaDigitada = function(){
        $scope.paginaInformada = $scope.filtro.pagina; 
    };                                             
    /**
      * Notifica que o total de itens por página foi alterado
      */                                            
    $scope.alterouItensPagina = function(){
        $scope.buscaLogs();   
    };
     
    // BUSCA
    $scope.resetaBusca = function(){
        $scope.filtro.busca = '';
        $scope.buscaLogs();
    };                                             
    $scope.filtraLogs = function(){
        //$scope.filtro.busca = filtro;
        $scope.buscaLogs();
    };
    $scope.buscaLogs = function(){
       $scope.showProgress(divPortletBodyLogsPos);    
        
       var filtros = undefined;
       
       // Só considera busca de filtro a partir de três caracteres    
       if($scope.filtro.busca.length > 0) filtros = {id: $scope.filtro.campo_busca.id, valor: $scope.filtro.busca + '%'};        
       // Filtro do grupo empresa => barra administrativa
       if($scope.usuariologado.grupoempresa){
            var filtroGrupoEmpresa = {/*id: $campos.administracao.logacesso.webpagesusers + 
                                          $campos.administracao.webpagesusers.id_grupo - 100, */
                                      id: 203,
                                      valor: $scope.usuariologado.grupoempresa.id_grupo};
            if(filtros) filtros = [filtros, filtroGrupoEmpresa];
            else filtros = [filtroGrupoEmpresa];
           
           if($scope.usuariologado.empresa){
                filtros.push({/*id: $campos.administracao.logacesso.webpagesusers + 
                                          $campos.administracao.webpagesusers.nu_cnpj - 100, */
                                      id: 204,
                                      valor: $scope.usuariologado.empresa.nu_cnpj});    
           }
       }
        
       $webapi.get($apis.getUrl($apis.administracao.logacesso, 
                                [$scope.token, 2, $scope.filtro.campo_ordenacao.id, 
                                 $scope.filtro.campo_ordenacao.order, 
                                 $scope.filtro.itens_pagina, $scope.filtro.pagina],
                   filtros)) 
            .then(function(dados){
                $scope.logs = dados.Registros;
                $scope.filtro.total_registros = dados.TotalDeRegistros;
                $scope.filtro.total_paginas = Math.ceil($scope.filtro.total_registros / $scope.filtro.itens_pagina);
                if($scope.logs.length === 0) $scope.filtro.faixa_registros = '0-0';
                else{
                    var registroInicial = ($scope.filtro.pagina - 1)*$scope.filtro.itens_pagina + 1;
                    var registroFinal = registroInicial - 1 + $scope.filtro.itens_pagina;
                    if(registroFinal > $scope.filtro.total_registros) registroFinal = $scope.filtro.total_registros;
                    $scope.filtro.faixa_registros =  registroInicial + '-' + registroFinal;
                }
                $scope.hideProgress(divPortletBodyLogsPos);
                // Verifica se a página atual é maior que o total de páginas
                if($scope.filtro.pagina > $scope.filtro.total_paginas)
                    setPagina(1); // volta para a primeira página e refaz a busca
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao requisitar logs (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyLogsPos);
              }); 
    };
        
                                                                                       
                                                
    /**
      * Exibe as todos os detalhes do log de acesso
      */
    $scope.detalhaLog = function(log){
        // Reseta permissões
        $scope.modalLog.log = log;
        // Exibe o modal
        $('#modalLog').modal('show');
        
    }; 

}])